import { Router } from 'express';
import { commitController } from '../controllers/commit.controller.js';

const router = Router();

// POST /api/commits/generate - Generate commit message from diff
router.post('/generate', commitController.generateCommitMessage.bind(commitController));

// POST /api/commits/analyze - Analyze a commit message
router.post('/analyze', commitController.analyzeCommitMessage.bind(commitController));

// GET /api/commits/history - Get commit history
router.get('/history', commitController.getCommitHistory.bind(commitController));

export default router;
