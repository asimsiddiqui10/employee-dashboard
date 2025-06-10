import express from 'express';
import { 
  createNotification, 
  getMyNotifications, 
  markAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// Get my notifications
router.get('/', getMyNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Create notification (admin only)
router.post('/', roleMiddleware(['admin']), createNotification);

export default router; 