import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { GitHubService } from '../services/github.service.js';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

const createRepoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  private: z.boolean().optional(),
  autoInit: z.boolean().optional(),
});

const createCommitSchema = z.object({
  repoId: z.string().uuid(),
  message: z.string().optional(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
  branch: z.string().optional(),
});

export class RepoController {
  async createRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = createRepoSchema.parse(req.body);

      const githubService = await GitHubService.forUser(userId);
      const repo = await githubService.createRepository(data);

      res.status(201).json({ repo });
    } catch (error) {
      next(error);
    }
  }

  async listRepos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const repos = await prisma.repo.findMany({
        where: { userId },
        include: {
          _count: {
            select: { commits: true, schedules: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.json({ repos });
    } catch (error) {
      next(error);
    }
  }

  async getRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const repo = await prisma.repo.findFirst({
        where: { id, userId },
        include: {
          commits: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          schedules: true,
        },
      });

      if (!repo) {
        res.status(404).json({ error: 'Repository not found' });
        return;
      }

      res.json({ repo });
    } catch (error) {
      next(error);
    }
  }

  async syncRepos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const githubService = await GitHubService.forUser(userId);

      const githubRepos = await githubService.listRepositories();

      // Sync repos with database
      const syncedRepos = [];
      for (const ghRepo of githubRepos) {
        const repo = await prisma.repo.upsert({
          where: { githubRepoId: String(ghRepo.id) },
          update: {
            name: ghRepo.name,
            fullName: ghRepo.full_name,
            description: ghRepo.description || undefined,
            private: ghRepo.private,
            defaultBranch: ghRepo.default_branch || 'main',
            htmlUrl: ghRepo.html_url,
            cloneUrl: ghRepo.clone_url || undefined,
          },
          create: {
            githubRepoId: String(ghRepo.id),
            name: ghRepo.name,
            fullName: ghRepo.full_name,
            description: ghRepo.description || undefined,
            private: ghRepo.private,
            defaultBranch: ghRepo.default_branch || 'main',
            htmlUrl: ghRepo.html_url,
            cloneUrl: ghRepo.clone_url || undefined,
            userId,
          },
        });
        syncedRepos.push(repo);
      }

      res.json({ repos: syncedRepos, count: syncedRepos.length });
    } catch (error) {
      next(error);
    }
  }

  async createCommit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = createCommitSchema.parse(req.body);

      const repo = await prisma.repo.findFirst({
        where: { id: data.repoId, userId },
      });

      if (!repo) {
        res.status(404).json({ error: 'Repository not found' });
        return;
      }

      const githubService = await GitHubService.forUser(userId);
      const [owner, repoName] = repo.fullName.split('/');

      // Generate commit message if not provided
      let commitMessage = data.message;
      if (!commitMessage) {
        const geminiService = (await import('../services/gemini.service.js')).geminiService;
        const fileChanges = data.files.map(f => `${f.path}: ${f.content.substring(0, 100)}...`).join('\n');
        const result = await geminiService.generateCommitMessage({
          diff: fileChanges,
          type: 'conventional',
        });
        commitMessage = result.suggestions[0];
      }

      // Create commit on GitHub
      for (const file of data.files) {
        await githubService.createOrUpdateFile({
          owner,
          repo: repoName,
          path: file.path,
          message: commitMessage,
          content: file.content,
          branch: data.branch || repo.defaultBranch,
        });
      }

      // Save commit record
      const commit = await prisma.commit.create({
        data: {
          message: commitMessage,
          author: req.user!.username,
          repoId: repo.id,
          userId,
          status: 'committed',
          committedAt: new Date(),
        },
      });

      res.status(201).json({ commit });
    } catch (error) {
      next(error);
    }
  }

  async deleteRepo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const repo = await prisma.repo.findFirst({
        where: { id, userId },
      });

      if (!repo) {
        res.status(404).json({ error: 'Repository not found' });
        return;
      }

      // Delete from database (schedules and commits will be cascade deleted)
      await prisma.repo.delete({ where: { id } });

      res.json({ message: 'Repository deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const repoController = new RepoController();
