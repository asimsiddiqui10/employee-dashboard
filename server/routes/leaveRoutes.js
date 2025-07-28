import express from 'express';
import {
  requestLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
  cancelLeaveRequest,
  getEmployeeLeaveRequests
} from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Employee routes
router.post('/request', requestLeave);
router.get('/my-requests', getMyLeaveRequests);
router.delete('/cancel/:requestId', cancelLeaveRequest);

// Admin routes
router.get('/all', roleMiddleware(['admin']), getAllLeaveRequests);
router.get('/employee/:employeeId', roleMiddleware(['admin']), getEmployeeLeaveRequests);
router.put('/:requestId/status', roleMiddleware(['admin']), updateLeaveStatus);

export default router; 