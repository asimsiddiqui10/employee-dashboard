import express from 'express';
import {
  getAllSchedules,
  getScheduleById,
  getEmployeeSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Employee-specific routes (must come before generic ID routes)
router.get('/employee/:employeeId', getEmployeeSchedules);

// Basic CRUD routes
router.get('/', roleMiddleware(['admin']), getAllSchedules);
router.get('/:id', getScheduleById);
router.post('/', roleMiddleware(['admin']), createSchedule);
router.put('/:id', roleMiddleware(['admin']), updateSchedule);
router.delete('/:id', roleMiddleware(['admin']), deleteSchedule);

export default router; 