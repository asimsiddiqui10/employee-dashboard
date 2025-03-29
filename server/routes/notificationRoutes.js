import express from 'express';
import { createNotification, getMyNotifications, markAsRead } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// Routes
router.post('/', createNotification);
router.get('/me', getMyNotifications);
router.patch('/:id/read', markAsRead);

export default router; 