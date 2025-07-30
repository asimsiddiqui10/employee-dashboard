import express from 'express';
import { getAttendanceData } from '../controllers/adminAttendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected by auth and require admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Admin attendance routes with time range parameter
router.get('/:timeRange', getAttendanceData);

export default router; 