import { Request, Response, NextFunction } from 'express';
import { commitService } from '../services/commit.service.js';
import { generateCommitSchema, analyzeCommitSchema } from '../types/commit.types.js';

export class CommitController {
  async generateCommitMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = generateCommitSchema.parse(req.body);
      const result = await commitService.generateCommitMessage(validatedData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async analyzeCommitMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = analyzeCommitSchema.parse(req.body);
      const result = await commitService.analyzeCommitMessage(validatedData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCommitHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await commitService.getCommitHistory(limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const commitController = new CommitController();
