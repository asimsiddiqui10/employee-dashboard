import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
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
  tags: [{
    type: String,
    trim: true
  }],
  link: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 