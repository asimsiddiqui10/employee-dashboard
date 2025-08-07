import mongoose from 'mongoose';

const notificationTypes = {
  PAYROLL: 'payroll',
  COMPANY: 'company',
  ANNOUNCEMENT: 'announcement',
  POLICY: 'policy',
  OTHER: 'other'
};

const recipientSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }
}, { _id: false });

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
  recipients: [recipientSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  link: {
    type: String,
    trim: true
  },
  metadata: {},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ 'recipients.employeeId': 1, createdAt: -1 });
notificationSchema.index({ 'recipients.employeeId': 1, 'recipients.read': 1 });

// Virtual to check if notification is read by specific employee
notificationSchema.methods.isReadByEmployee = function(employeeId) {
  const recipient = this.recipients.find(r => r.employeeId.toString() === employeeId.toString());
  return recipient ? recipient.read : false;
};

// Method to mark as read by specific employee
notificationSchema.methods.markAsReadByEmployee = function(employeeId) {
  const recipient = this.recipients.find(r => r.employeeId.toString() === employeeId.toString());
  if (recipient && !recipient.read) {
    recipient.read = true;
    recipient.readAt = new Date();
    recipient.readBy = employeeId;
    return true;
  }
  return false;
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 