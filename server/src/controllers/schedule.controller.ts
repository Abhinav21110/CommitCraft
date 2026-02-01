import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { schedulerService } from '../services/scheduler.service.js';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

const createScheduleSchema = z.object({
  repoId: z.string().uuid(),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'custom']),
  cronExpression: z.string().optional(),
  commitsPerRun: z.number().int().min(1).max(10).default(1),
});

const updateScheduleSchema = z.object({
  frequency: z.enum(['hourly', 'daily', 'weekly', 'custom']).optional(),
  cronExpression: z.string().optional(),
  commitsPerRun: z.number().int().min(1).max(10).optional(),
  enabled: z.boolean().optional(),
});

export class ScheduleController {
  async createSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = createScheduleSchema.parse(req.body);

      // Verify repo belongs to user
      const repo = await prisma.repo.findFirst({
        where: { id: data.repoId, userId },
      });

      if (!repo) {
        res.status(404).json({ error: 'Repository not found' });
        return;
      }

      // Check if schedule already exists for this repo
      const existingSchedule = await prisma.commitSchedule.findFirst({
        where: { repoId: data.repoId, userId },
      });

      if (existingSchedule) {
        res.status(400).json({ error: 'Schedule already exists for this repository' });
        return;
      }

      const schedule = await schedulerService.createSchedule({
        ...data,
        userId,
      });

      res.status(201).json({ schedule });
    } catch (error) {
      next(error);
    }
  }

  async listSchedules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const schedules = await prisma.commitSchedule.findMany({
        where: { userId },
        include: {
          repo: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ schedules });
    } catch (error) {
      next(error);
    }
  }

  async getSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const schedule = await prisma.commitSchedule.findFirst({
        where: { id, userId },
        include: {
          repo: true,
        },
      });

      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      res.json({ schedule });
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const data = updateScheduleSchema.parse(req.body);

      const existingSchedule = await prisma.commitSchedule.findFirst({
        where: { id, userId },
      });

      if (!existingSchedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      const schedule = await schedulerService.updateSchedule(id, data);

      res.json({ schedule });
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const schedule = await prisma.commitSchedule.findFirst({
        where: { id, userId },
      });

      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      await schedulerService.deleteSchedule(id);

      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async toggleSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const schedule = await prisma.commitSchedule.findFirst({
        where: { id, userId },
      });

      if (!schedule) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      const updatedSchedule = await schedulerService.updateSchedule(id, {
        enabled: !schedule.enabled,
      });

      res.json({ schedule: updatedSchedule });
    } catch (error) {
      next(error);
    }
  }

  async executeSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      console.log(`📋 Executing schedule ${id} for user ${userId}`);

      const schedule = await prisma.commitSchedule.findFirst({
        where: { id, userId },
        include: {
          repo: true,
          user: true,
        },
      });

      if (!schedule) {
        console.log(`❌ Schedule ${id} not found`);
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      console.log(`✅ Found schedule, executing ${schedule.commitsPerRun} commits...`);

      // Execute the scheduled commits immediately
      await schedulerService.executeScheduledCommits(schedule);

      console.log(`✅ Schedule ${id} executed successfully`);

      res.json({ message: 'Schedule executed successfully', commitsCreated: schedule.commitsPerRun });
    } catch (error) {
      console.error(`❌ Error executing schedule:`, error);
      next(error);
    }
  }
}

export const scheduleController = new ScheduleController();
