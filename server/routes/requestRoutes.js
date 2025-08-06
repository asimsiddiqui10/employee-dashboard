import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  createRequest,
  getAllRequests,
  getEmployeeRequests,
  updateRequestStatus,
  getRequestById
} from '../controllers/requestController.js';

const router = express.Router();

// Employee routes
router.post('/', authMiddleware, createRequest);
router.get('/my-requests', authMiddleware, getEmployeeRequests);

// Admin routes
router.get('/all', authMiddleware, roleMiddleware(['admin']), getAllRequests);
router.put('/:requestId/status', authMiddleware, roleMiddleware(['admin']), updateRequestStatus);

// Common routes
router.get('/:requestId', authMiddleware, getRequestById);

export default router; 