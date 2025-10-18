import express from 'express';
import {
  createSchedule,
  getAllSchedules,
  getSchedulesByEmployee,
  getSchedulesByDateRange,
  updateSchedule,
  deleteSchedule,
  createCompanyDefault,
  getCompanyDefaults,
  updateCompanyDefault,
  deleteCompanyDefault
} from '../controllers/scheduleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Schedule routes
router.post('/', authMiddleware, roleMiddleware(['admin']), createSchedule);
router.get('/', authMiddleware, getAllSchedules);
router.get('/employee/:employeeId', authMiddleware, getSchedulesByEmployee);
router.get('/date-range', authMiddleware, getSchedulesByDateRange);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateSchedule);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteSchedule);

// Company default routes
router.post('/company-defaults', authMiddleware, roleMiddleware(['admin']), createCompanyDefault);
router.get('/company-defaults', authMiddleware, getCompanyDefaults);
router.put('/company-defaults/:id', authMiddleware, roleMiddleware(['admin']), updateCompanyDefault);
router.delete('/company-defaults/:id', authMiddleware, roleMiddleware(['admin']), deleteCompanyDefault);

export default router;

