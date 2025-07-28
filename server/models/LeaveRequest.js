import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Vacation', 'Sick', 'Personal', 'Family', 'Bereavement', 'Other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  noticeDays: {
    type: Number,
    required: true,
    default: function() {
      return Math.ceil((this.startDate - new Date()) / (1000 * 60 * 60 * 24));
    }
  },
  description: {
    type: String,
    required: false,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Virtual field for submittedAt date
leaveRequestSchema.virtual('submittedAt').get(function() {
  return this.createdAt;
});

// Middleware to validate dates
leaveRequestSchema.pre('save', function(next) {
  // Validate start and end dates
  if (this.startDate > this.endDate) {
    next(new Error('Start date cannot be after end date'));
  }

  // Calculate notice days
  this.noticeDays = Math.ceil((this.startDate - new Date()) / (1000 * 60 * 60 * 24));

  // If status is being updated to Approved/Rejected
  if (this.isModified('status') && this.status !== 'Pending') {
    this.reviewedAt = new Date();
  }

  next();
});

// Method to check if leave can be cancelled
leaveRequestSchema.methods.canBeCancelled = function() {
  return this.status === 'Pending' || 
         (this.status === 'Approved' && this.startDate > new Date());
};

// Configure toJSON to include virtuals
leaveRequestSchema.set('toJSON', { virtuals: true });
leaveRequestSchema.set('toObject', { virtuals: true });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest; 