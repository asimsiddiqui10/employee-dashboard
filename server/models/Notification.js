import mongoose from 'mongoose';

const notificationTypes = {
  PAYROLL: 'payroll',
  COMPANY: 'company',
  ANNOUNCEMENT: 'announcement',
  POLICY: 'policy',
  OTHER: 'other'
};

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(notificationTypes),
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  link: {
    type: String,
    trim: true
  },
  metadata: {}
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 