import express from 'express';
import { 
  requestLeave, 
  updateLeaveStatus, 
  getMyLeaveRequests, 
  getAllLeaveRequests 
} from '../controllers/leaveController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// Employee routes
router.post('/request', requestLeave);
router.get('/my-requests', getMyLeaveRequests);

// Admin routes
router.get('/all', roleMiddleware(['admin']), getAllLeaveRequests);
router.patch('/:id/status', roleMiddleware(['admin']), updateLeaveStatus);

export default router; 