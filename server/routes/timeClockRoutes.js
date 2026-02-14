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
  managerApprove,
  cleanupOrphanedEntries,
  kioskClockIn,
  kioskStartBreak,
  kioskEndBreak,
  kioskClockOut,
  kioskGetStatus
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
router.post('/cleanup', cleanupOrphanedEntries);

// Admin routes
router.get('/today/all', roleMiddleware(['admin']), getAllTodayEntries);
router.get('/:period/all', roleMiddleware(['admin']), getTimeEntriesByPeriod);
router.put('/:timeEntryId/approve', roleMiddleware(['admin']), managerApprove);

// Kiosk routes (admin-only)
router.post('/kiosk/clock-in', roleMiddleware(['admin']), kioskClockIn);
router.post('/kiosk/break/start', roleMiddleware(['admin']), kioskStartBreak);
router.post('/kiosk/break/end', roleMiddleware(['admin']), kioskEndBreak);
router.post('/kiosk/clock-out', roleMiddleware(['admin']), kioskClockOut);
router.get('/kiosk/status/:employeeId', roleMiddleware(['admin']), kioskGetStatus);

export default router; 