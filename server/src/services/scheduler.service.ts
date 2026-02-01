import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { GitHubService } from './github.service.js';
import { geminiService } from './gemini.service.js';

class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  async initialize() {
    console.log('🔄 Initializing scheduler...');
    
    // Load all active schedules
    const schedules = await prisma.commitSchedule.findMany({
      where: { enabled: true },
      include: { repo: true, user: true },
    });

    for (const schedule of schedules) {
      this.scheduleJob(schedule);
    }

    console.log(`✅ Initialized ${schedules.length} scheduled jobs`);
  }

  scheduleJob(schedule: any) {
    const cronExpression = schedule.cronExpression || this.getCronExpression(schedule.frequency);

    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression for schedule ${schedule.id}: ${cronExpression}`);
      return;
    }

    const task = cron.schedule(cronExpression, async () => {
      await this.executeScheduledCommits(schedule);
    });

    this.jobs.set(schedule.id, task);
    console.log(`📅 Scheduled job ${schedule.id} with expression: ${cronExpression}`);
  }

  private getCronExpression(frequency: string): string {
    switch (frequency) {
      case 'hourly':
        return '0 * * * *'; // Every hour
      case 'daily':
        return '0 9 * * *'; // Every day at 9 AM
      case 'weekly':
        return '0 9 * * 1'; // Every Monday at 9 AM
      default:
        return '0 9 * * *'; // Default to daily
    }
  }

  private async executeScheduledCommits(schedule: any) {
    console.log(`🚀 Executing scheduled commits for schedule ${schedule.id}`);

    try {
      const githubService = await GitHubService.forUser(schedule.userId);
      const [owner, repoName] = schedule.repo.fullName.split('/');

      for (let i = 0; i < schedule.commitsPerRun; i++) {
        // Generate random code changes
        const instruction = this.generateRandomInstruction();
        const changes = await geminiService.generateCodeChanges(
          instruction,
          schedule.repo.description || undefined
        );

        // Generate commit message
        const commitMessageData = await geminiService.generateCommitMessage({
          diff: `Generated changes: ${changes.explanation}`,
          projectDescription: schedule.repo.description || undefined,
          type: 'conventional',
        });

        const commitMessage = commitMessageData.suggestions[0] || 'chore: automated commit';

        // Create commit
        const file = changes.files[0] || {
          path: `updates/update-${Date.now()}.md`,
          content: `# Update\n\n${changes.explanation}\n\nGenerated at: ${new Date().toISOString()}`,
        };

        await githubService.createOrUpdateFile({
          owner,
          repo: repoName,
          path: file.path,
          message: commitMessage,
          content: file.content,
          branch: schedule.repo.defaultBranch,
        });

        // Save commit record
        await prisma.commit.create({
          data: {
            message: commitMessage,
            description: changes.explanation,
            author: schedule.user.username,
            repoId: schedule.repoId,
            userId: schedule.userId,
            status: 'committed',
            committedAt: new Date(),
          },
        });

        console.log(`✅ Created commit ${i + 1}/${schedule.commitsPerRun} for ${schedule.repo.name}`);

        // Wait a bit between commits to avoid rate limiting
        if (i < schedule.commitsPerRun - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Update schedule
      await prisma.commitSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: this.calculateNextRun(schedule.frequency, schedule.cronExpression),
        },
      });

      console.log(`✅ Successfully executed ${schedule.commitsPerRun} commits for schedule ${schedule.id}`);
    } catch (error: any) {
      console.error(`❌ Failed to execute scheduled commits for ${schedule.id}:`, error.message);
    }
  }

  private generateRandomInstruction(): string {
    const instructions = [
      'Update documentation with latest changes',
      'Refactor code for better performance',
      'Add new utility functions',
      'Update configuration files',
      'Improve error handling',
      'Add new test cases',
      'Update dependencies',
      'Fix minor bugs',
      'Improve code readability',
      'Add code comments and documentation',
    ];

    return instructions[Math.floor(Math.random() * instructions.length)];
  }

  private calculateNextRun(frequency: string, cronExpression?: string): Date {
    const now = new Date();
    
    if (cronExpression) {
      // For custom cron, calculate based on the expression
      // This is simplified - in production, use a proper cron parser
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    }

    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  async createSchedule(data: {
    repoId: string;
    userId: string;
    frequency: string;
    cronExpression?: string;
    commitsPerRun: number;
  }) {
    const schedule = await prisma.commitSchedule.create({
      data: {
        repoId: data.repoId,
        userId: data.userId,
        frequency: data.frequency,
        cronExpression: data.cronExpression,
        commitsPerRun: data.commitsPerRun,
        enabled: true,
        nextRunAt: this.calculateNextRun(data.frequency, data.cronExpression),
      },
      include: { repo: true, user: true },
    });

    this.scheduleJob(schedule);
    return schedule;
  }

  async updateSchedule(scheduleId: string, data: {
    frequency?: string;
    cronExpression?: string;
    commitsPerRun?: number;
    enabled?: boolean;
  }) {
    // Stop existing job
    const existingJob = this.jobs.get(scheduleId);
    if (existingJob) {
      existingJob.stop();
      this.jobs.delete(scheduleId);
    }

    // Update schedule
    const schedule = await prisma.commitSchedule.update({
      where: { id: scheduleId },
      data: {
        ...data,
        nextRunAt: data.frequency || data.cronExpression
          ? this.calculateNextRun(data.frequency!, data.cronExpression)
          : undefined,
      },
      include: { repo: true, user: true },
    });

    // Restart job if enabled
    if (schedule.enabled) {
      this.scheduleJob(schedule);
    }

    return schedule;
  }

  async deleteSchedule(scheduleId: string) {
    const job = this.jobs.get(scheduleId);
    if (job) {
      job.stop();
      this.jobs.delete(scheduleId);
    }

    await prisma.commitSchedule.delete({
      where: { id: scheduleId },
    });
  }

  stopAll() {
    for (const [id, job] of this.jobs.entries()) {
      job.stop();
    }
    this.jobs.clear();
    console.log('🛑 All scheduled jobs stopped');
  }
}

export const schedulerService = new SchedulerService();
