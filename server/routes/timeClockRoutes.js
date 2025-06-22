import express from 'express';
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getTodayTimeEntry,
  getTimeEntries,
  getTimeSummary
} from '../controllers/timeClockController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected by auth middleware
router.use(authMiddleware);

// Time clock operations
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);

// Time entries retrieval
router.get('/today', getTodayTimeEntry);
router.get('/', getTimeEntries);
router.get('/summary', getTimeSummary);

// Get all time entries for today (admin only)
router.get('/today/all', roleMiddleware(['admin']), getTodayTimeEntry);

export default router; 