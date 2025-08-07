import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';

// Create notification (Admin only)
export const createNotification = async (req, res) => {
  try {
    const { type, title, message, recipients, priority, link } = req.body;
    const sender = req.user._id;

    // Validate recipients array
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipients array is required and must not be empty' 
      });
    }

    // Get employee IDs from user IDs
    const employees = await Employee.find({ user: { $in: recipients } }).select('_id user');
    const employeeMap = employees.reduce((map, emp) => {
      map[emp.user.toString()] = emp._id;
      return map;
    }, {});

    // Create recipients array with read tracking
    const recipientsArray = recipients.map(userId => ({
      employeeId: employeeMap[userId],
      read: false,
      readAt: null,
      readBy: null
    })).filter(recipient => recipient.employeeId); // Filter out invalid employee IDs

    if (recipientsArray.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid employees found for the provided recipients' 
      });
    }

    // Create single notification with all recipients
    const notification = new Notification({
      type,
      title,
      message,
      sender,
      recipients: recipientsArray,
      priority: priority || 'medium',
      link: link || ''
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: `Notification sent to ${recipientsArray.length} recipient(s)`,
      data: notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating notification' 
    });
  }
};

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { timeFilter } = req.query;

    // Build date filter
    let dateFilter = {};
    if (timeFilter) {
      const now = new Date();
      switch (timeFilter) {
        case '1h':
          dateFilter = { createdAt: { $gte: new Date(now - 60 * 60 * 1000) } };
          break;
        case '24h':
          dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
          break;
        case '7d':
          dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
          break;
      }
    }

    // Find notifications where current employee is a recipient
    const notifications = await Notification.find({
      'recipients.employeeId': employeeId,
      ...dateFilter
    })
    .populate('sender', 'name email')
    .sort({ createdAt: -1 })
    .lean();

    // Transform notifications to include read status for current employee
    const transformedNotifications = notifications.map(notification => {
      const recipient = notification.recipients.find(r => r.employeeId.toString() === employeeId.toString());
      
      return {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        sender: notification.sender,
        priority: notification.priority,
        link: notification.link,
        createdAt: notification.createdAt,
        isRead: recipient ? recipient.read : false,
        readAt: recipient ? recipient.readAt : null
      };
    });

    res.json(transformedNotifications);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notifications' 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const employeeId = req.user.employee;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    // Check if current employee is a recipient
    const recipientIndex = notification.recipients.findIndex(r => 
      r.employeeId.toString() === employeeId.toString()
    );

    if (recipientIndex === -1) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to access this notification' 
      });
    }

    // Mark as read if not already read
    if (!notification.recipients[recipientIndex].read) {
      notification.recipients[recipientIndex].read = true;
      notification.recipients[recipientIndex].readAt = new Date();
      notification.recipients[recipientIndex].readBy = employeeId;
      
      await notification.save();
    }

    res.json({ 
      success: true, 
      message: 'Notification marked as read' 
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking notification as read' 
    });
  }
};

// Get all notifications (Admin only)
export const getAllNotifications = async (req, res) => {
  try {
    const { timeFilter } = req.query;

    // Build date filter
    let dateFilter = {};
    if (timeFilter) {
      const now = new Date();
      switch (timeFilter) {
        case '1h':
          dateFilter = { createdAt: { $gte: new Date(now - 60 * 60 * 1000) } };
          break;
        case '24h':
          dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
          break;
        case '7d':
          dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
          break;
      }
    }

    const notifications = await Notification.find(dateFilter)
      .populate('sender', 'name email')
      .populate('recipients.employeeId', 'name employeeId')
      .sort({ createdAt: -1 });

    // Transform notifications to include recipient statistics
    const transformedNotifications = notifications.map(notification => ({
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      sender: notification.sender,
      priority: notification.priority,
      link: notification.link,
      createdAt: notification.createdAt,
      totalRecipients: notification.recipients.length,
      readCount: notification.recipients.filter(r => r.read).length,
      unreadCount: notification.recipients.filter(r => !r.read).length,
      recipients: notification.recipients
    }));

    res.json(transformedNotifications);

  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notifications' 
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const count = await Notification.countDocuments({
      'recipients.employeeId': employeeId,
      'recipients.read': false
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
  getNotifications,
  markAsRead,
  getUnreadCount,
  createPayrollNotification,
  getAllNotifications
}; 