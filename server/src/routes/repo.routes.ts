import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { repoController } from '../controllers/repo.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/repos - Create a new repository
router.post('/', repoController.createRepo.bind(repoController));

// GET /api/repos - List all user repositories
router.get('/', repoController.listRepos.bind(repoController));

// GET /api/repos/sync - Sync repositories from GitHub
router.get('/sync', repoController.syncRepos.bind(repoController));

// GET /api/repos/:id - Get repository details
router.get('/:id', repoController.getRepo.bind(repoController));

// GET /api/repos/:id/contents - Get repository contents
router.get('/:id/contents', repoController.getRepoContents.bind(repoController));

// GET /api/repos/:id/commits - Get repository commits
router.get('/:id/commits', repoController.getRepoCommits.bind(repoController));

// DELETE /api/repos/:id - Delete a repository
router.delete('/:id', repoController.deleteRepo.bind(repoController));

// POST /api/repos/commits - Create a commit
router.post('/commits', repoController.createCommit.bind(repoController));

export default router;
