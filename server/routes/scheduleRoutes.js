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
  bulkDeleteSchedules,
  bulkDeleteSchedulesByIds,
  bulkUpdateSchedules,
  getSchedulesByDateRangeForBulk
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
router.get('/bulk/date-range', authMiddleware, getSchedulesByDateRangeForBulk);
router.delete('/bulk-delete', authMiddleware, roleMiddleware(['admin']), bulkDeleteSchedules);
router.delete('/bulk-delete-by-ids', authMiddleware, roleMiddleware(['admin']), bulkDeleteSchedulesByIds);
router.put('/bulk-update', authMiddleware, roleMiddleware(['admin']), bulkUpdateSchedules);
router.get('/:id', authMiddleware, getScheduleById);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateSchedule);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteSchedule);

export default router;

