import express from 'express';
import { 
  clockIn, 
  clockOut, 
  startBreak, 
  endBreak, 
  getTodayTimeEntry,
  getTimeEntries,
  getTimeSummary,
  getAllTodayEntries,
  getTimeEntriesByPeriod,
  managerApprove
} from '../controllers/timeClockController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected by auth middleware
router.use(authMiddleware);

// Employee routes
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.get('/today', getTodayTimeEntry);
router.get('/', getTimeEntries);
router.get('/summary', getTimeSummary);

// Admin routes
router.get('/today/all', roleMiddleware(['admin']), getAllTodayEntries);
router.get('/:period/all', roleMiddleware(['admin']), getTimeEntriesByPeriod);
router.put('/:timeEntryId/approve', roleMiddleware(['admin']), managerApprove);

export default router; 