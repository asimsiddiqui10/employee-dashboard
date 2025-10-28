import express from 'express';
import {
  createSchedule,
  createBatchSchedules,
  checkTimeConflicts,
  getAllSchedules,
  getSchedulesByEmployee,
  getSchedulesByDateRange,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  bulkDeleteSchedules
} from '../controllers/scheduleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Schedule routes
router.post('/', authMiddleware, roleMiddleware(['admin']), createSchedule);
router.post('/batch', authMiddleware, roleMiddleware(['admin']), createBatchSchedules);
router.post('/check-conflicts', authMiddleware, checkTimeConflicts);
router.get('/', authMiddleware, getAllSchedules);
router.get('/employee/:id', authMiddleware, getSchedulesByEmployee);
router.get('/date-range', authMiddleware, getSchedulesByDateRange);
router.get('/:id', authMiddleware, getScheduleById);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateSchedule);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteSchedule);
router.delete('/bulk-delete', authMiddleware, roleMiddleware(['admin']), bulkDeleteSchedules);

export default router;

