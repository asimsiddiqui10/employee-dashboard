import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotification = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can create notifications' 
      });
    }

    const { title, message, recipients, tags, link } = req.body;
    const sender = req.user._id;

    const notification = new Notification({
      title,
      message,
      sender,
      recipients,
      tags,
      link
    });

    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    console.log('User requesting notifications:', req.user._id); // Debug log
    
    const notifications = await Notification.find({
      recipients: req.user._id
    })
    .populate('sender', 'name')
    .sort({ createdAt: -1 });

    console.log('Found notifications:', notifications); // Debug log
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (!notification.recipients.includes(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}; 