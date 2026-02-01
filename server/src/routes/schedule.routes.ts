import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { scheduleController } from '../controllers/schedule.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/schedules - Create a new commit schedule
router.post('/', scheduleController.createSchedule.bind(scheduleController));

// GET /api/schedules - List all user schedules
router.get('/', scheduleController.listSchedules.bind(scheduleController));

// GET /api/schedules/:id - Get schedule details
router.get('/:id', scheduleController.getSchedule.bind(scheduleController));

// PUT /api/schedules/:id - Update a schedule
router.put('/:id', scheduleController.updateSchedule.bind(scheduleController));

// DELETE /api/schedules/:id - Delete a schedule
router.delete('/:id', scheduleController.deleteSchedule.bind(scheduleController));

// POST /api/schedules/:id/toggle - Toggle schedule enabled/disabled
router.post('/:id/toggle', scheduleController.toggleSchedule.bind(scheduleController));

export default router;
