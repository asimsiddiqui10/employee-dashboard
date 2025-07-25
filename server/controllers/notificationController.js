import Notification from '../models/Notification.js';
import User from '../models/User.js';

const notificationTypes = {
  PAYROLL: 'payroll',
  COMPANY: 'company',
  ANNOUNCEMENT: 'announcement',
  POLICY: 'policy',
  OTHER: 'other'
};

// Helper function to get date filter based on timeFilter parameter
const getDateFilter = (timeFilter) => {
  const now = new Date();
  switch (timeFilter) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000);
    case 'week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return startOfMonth;
    default:
      return null;
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const { timeFilter = '24h' } = req.query;
    
    // Build query
    const query = {};
    const dateFilter = getDateFilter(timeFilter);
    if (dateFilter) {
      query.createdAt = { $gte: dateFilter };
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name')
      .populate('recipients', 'name')
      .sort('-createdAt')
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { type, title, message, recipients, priority = 'medium', link } = req.body;

    // Validate notification type
    if (!Object.values(notificationTypes).includes(type)) {
      return res.status(400).json({ 
        message: `Invalid notification type. Must be one of: ${Object.values(notificationTypes).join(', ')}` 
      });
    }

    // Create notification for each recipient
    const notifications = await Promise.all(
      recipients.map(recipientId => 
        Notification.create({
          type,
          title,
          message,
          sender: req.user._id,
          recipients: [recipientId],
          priority,
          link,
          isRead: false
        })
      )
    );

    // If we have socket.io setup, emit to recipients
    if (req.io) {
      recipients.forEach(recipientId => {
        req.io.to(recipientId.toString()).emit('new_notification', {
          type,
          title,
          message,
          sender: req.user._id
        });
      });
    }

    res.status(201).json({ 
      message: 'Notifications created successfully',
      count: notifications.length 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipients: req.user._id 
    })
    .populate('sender', 'name')
    .sort('-createdAt')
    .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipients: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipients: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

export const createPayrollNotification = async (employeeIds, period) => {
  try {
    const notifications = await Promise.all(
      employeeIds.map(employeeId => 
        Notification.create({
          type: 'payroll',
          title: 'New Payroll Document Available',
          message: `Your payroll document for ${period} has been uploaded`,
          sender: req.user._id,
          recipients: [employeeId],
          priority: 'high',
          link: '/employee-dashboard/payroll'
        })
      )
    );

    // Emit socket events if socket.io is setup
    if (global.io) {
      employeeIds.forEach(employeeId => {
        global.io.to(employeeId.toString()).emit('new_notification', {
          type: 'payroll',
          title: 'New Payroll Document Available',
          message: `Your payroll document for ${period} has been uploaded`
        });
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error creating payroll notifications:', error);
    throw error;
  }
};

export default {
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
  createPayrollNotification,
  getAllNotifications
}; 