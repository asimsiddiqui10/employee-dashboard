import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { 
  createNotification, 
  getNotifications, 
  markAsRead, 
  getUnreadCount,
  getAllNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Employee routes
router.get('/', authMiddleware, getNotifications);
router.patch('/:notificationId/read', authMiddleware, markAsRead);
router.get('/unread-count', authMiddleware, getUnreadCount);

// Admin routes
router.post('/', authMiddleware, roleMiddleware(['admin']), createNotification);
router.get('/all', authMiddleware, roleMiddleware(['admin']), getAllNotifications);

export default router;