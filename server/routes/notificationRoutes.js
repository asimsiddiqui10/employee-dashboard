import { Router } from 'express';
import {
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  getAllNotifications
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = Router();

// Protected routes
router.use(authMiddleware);

// Get all notifications (admin only)
router.get('/all', roleMiddleware(['admin']), getAllNotifications);

// Get my notifications
router.get('/', getMyNotifications);

// Get unread notifications count
router.get('/unread', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Create notification (admin only)
router.post('/', roleMiddleware(['admin']), createNotification);

export default router;