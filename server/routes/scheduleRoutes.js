import express from 'express';
import {
  getAllSchedules,
  getScheduleById,
  getEmployeeSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateApprovalStatus,
  copyScheduleToNextWeek,
  createScheduleFromCompanyDefault,
  getScheduleStats,
  bulkUpdateSchedules,
  exportSchedules
} from '../controllers/scheduleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all schedules (admin only)
router.get('/', roleMiddleware(['admin']), getAllSchedules);

// Get schedule by ID (admin and employee can view their own)
router.get('/:id', getScheduleById);

// Get schedules for a specific employee
router.get('/employee/:employeeId', getEmployeeSchedules);

// Create new schedule (admin only)
router.post('/', roleMiddleware(['admin']), createSchedule);

// Create schedule from company default (admin only)
router.post('/from-company-default', roleMiddleware(['admin']), createScheduleFromCompanyDefault);

// Update schedule (admin only)
router.put('/:id', roleMiddleware(['admin']), updateSchedule);

// Delete schedule (admin only)
router.delete('/:id', roleMiddleware(['admin']), deleteSchedule);

// Update approval status (admin only)
router.patch('/:id/approval', roleMiddleware(['admin']), updateApprovalStatus);

// Copy schedule to next week (admin only)
router.post('/:id/copy', roleMiddleware(['admin']), copyScheduleToNextWeek);

// Get schedule statistics (admin only)
router.get('/stats/overview', roleMiddleware(['admin']), getScheduleStats);

// Bulk update schedules (admin only)
router.patch('/bulk', roleMiddleware(['admin']), bulkUpdateSchedules);

// Export schedules (admin only)
router.get('/export/data', roleMiddleware(['admin']), exportSchedules);

export default router; 