import mongoose from 'mongoose';

const scheduledWorkSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  timesheetGenerated: {
    type: Boolean,
    default: false
  },
  timesheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeEntry',
    default: null
  },
  jobCode: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    maxLength: 500
  },
  breaks: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0
    },
    type: {
      type: String,
      enum: ['lunch', 'break', 'custom'],
      default: 'break'
    }
  }],
  totalBreakTime: {
    type: Number, // Total break time in minutes
    default: 0
  },
  netWorkHours: {
    type: Number, // Total work hours minus breaks
    default: 0
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    daysOfWeek: [{
      type: Number, // 0-6 (Sunday-Saturday)
      min: 0,
      max: 6
    }],
    endDate: Date
  }
}, {
  timestamps: true
});

// Add indexes for efficient queries
scheduledWorkSchema.index({ employee: 1, date: 1 });
scheduledWorkSchema.index({ status: 1 });
scheduledWorkSchema.index({ date: 1, status: 1 });

// Method to check if schedule is active for a given date
scheduledWorkSchema.methods.isActiveForDate = function(checkDate) {
  if (this.status !== 'scheduled') return false;
  
  const scheduleDate = new Date(this.date);
  const checkDateOnly = new Date(checkDate);
  
  // Check if it's the same date
  if (scheduleDate.toDateString() === checkDateOnly.toDateString()) {
    return true;
  }
  
  // Check recurring patterns
  if (this.recurring.enabled) {
    const dayOfWeek = checkDateOnly.getDay();
    
    if (this.recurring.pattern === 'daily') {
      return true;
    } else if (this.recurring.pattern === 'weekly') {
      return this.recurring.daysOfWeek.includes(dayOfWeek);
    } else if (this.recurring.pattern === 'monthly') {
      return scheduleDate.getDate() === checkDateOnly.getDate();
    }
  }
  
  return false;
};

// Method to get the next occurrence date
scheduledWorkSchema.methods.getNextOccurrence = function() {
  if (!this.recurring.enabled) return null;
  
  const today = new Date();
  let nextDate = new Date(this.startTime);
  
  while (nextDate <= today) {
    if (this.recurring.pattern === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (this.recurring.pattern === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (this.recurring.pattern === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
  }
  
  return nextDate;
};

const ScheduledWork = mongoose.model('ScheduledWork', scheduledWorkSchema);
export default ScheduledWork; 