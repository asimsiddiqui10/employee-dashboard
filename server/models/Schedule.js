import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true,
    index: true
  },
  weekEndDate: {
    type: Date,
    required: true,
    index: true
  },
  schedules: [{
    date: {
      type: Date,
      required: true
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: String, // Format: "HH:MM" (24-hour)
      required: function() { return this.enabled; }
    },
    endTime: {
      type: String, // Format: "HH:MM" (24-hour)
      required: function() { return this.enabled; }
    },
    hours: {
      type: Number,
      min: 0,
      max: 24,
      required: function() { return this.enabled; }
    },
    jobCode: {
      type: String,
      required: function() { return this.enabled; },
      default: 'ACT001'
    },
    rate: {
      type: Number,
      min: 0,
      required: function() { return this.enabled; }
    },
    notes: {
      type: String,
      maxLength: 500
    },
    isWeekend: {
      type: Boolean,
      default: false
    }
  }],
  totalWeeklyHours: {
    type: Number,
    min: 0,
    max: 168, // 7 days * 24 hours
    default: 0
  },
  totalWeeklyPay: {
    type: Number,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'cancelled'],
    default: 'draft'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvalDate: Date,
  approvalNotes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  version: {
    type: Number,
    default: 1
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    maxLength: 100
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
scheduleSchema.index({ employee: 1, weekStartDate: 1, status: 1 });
scheduleSchema.index({ employeeId: 1, weekStartDate: 1 });
scheduleSchema.index({ status: 1, approvalStatus: 1 });
scheduleSchema.index({ weekStartDate: 1, weekEndDate: 1 });

// Pre-save middleware to calculate totals and validate data
scheduleSchema.pre('save', function(next) {
  // Calculate total weekly hours and pay
  this.totalWeeklyHours = this.schedules
    .filter(schedule => schedule.enabled)
    .reduce((total, schedule) => total + (schedule.hours || 0), 0);
  
  this.totalWeeklyPay = this.schedules
    .filter(schedule => schedule.enabled)
    .reduce((total, schedule) => total + ((schedule.hours || 0) * (schedule.rate || 0)), 0);
  
  // Set week start and end dates if not provided
  if (!this.weekStartDate || !this.weekEndDate) {
    const schedules = this.schedules.filter(s => s.enabled);
    if (schedules.length > 0) {
      const dates = schedules.map(s => s.date).sort();
      this.weekStartDate = dates[0];
      this.weekEndDate = dates[dates.length - 1];
    }
  }
  
  // Increment version on each save
  this.version += 1;
  
  next();
});

// Pre-save middleware to set day of week and weekend flag
scheduleSchema.pre('save', function(next) {
  this.schedules.forEach(schedule => {
    if (schedule.date) {
      const date = new Date(schedule.date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      schedule.dayOfWeek = days[date.getDay()];
      schedule.isWeekend = date.getDay() === 0 || date.getDay() === 6;
    }
  });
  next();
});

// Instance method to get schedule for a specific date
scheduleSchema.methods.getScheduleForDate = function(date) {
  const dateStr = date.toISOString().split('T')[0];
  return this.schedules.find(schedule => 
    schedule.date.toISOString().split('T')[0] === dateStr
  );
};

// Instance method to get total hours for a date range
scheduleSchema.methods.getTotalHoursForRange = function(startDate, endDate) {
  return this.schedules
    .filter(schedule => 
      schedule.enabled && 
      schedule.date >= startDate && 
      schedule.date <= endDate
    )
    .reduce((total, schedule) => total + (schedule.hours || 0), 0);
};

// Static method to find schedules for an employee in a date range
scheduleSchema.statics.findByEmployeeAndDateRange = function(employeeId, startDate, endDate) {
  return this.find({
    employeeId,
    weekStartDate: { $lte: endDate },
    weekEndDate: { $gte: startDate }
  }).populate('employee', 'name employeeId department');
};

// Static method to find active schedules for an employee
scheduleSchema.statics.findActiveByEmployee = function(employeeId) {
  return this.find({
    employeeId,
    status: 'active',
    weekStartDate: { $lte: new Date() },
    weekEndDate: { $gte: new Date() }
  }).populate('employee', 'name employeeId department');
};

// Static method to create schedule from template
scheduleSchema.statics.createFromTemplate = function(templateId, employeeId, weekStartDate) {
  return this.findById(templateId).then(template => {
    if (!template || !template.isTemplate) {
      throw new Error('Invalid template');
    }
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    const newSchedules = template.schedules.map(schedule => ({
      ...schedule.toObject(),
      date: new Date(weekStartDate.getTime() + (schedule.date.getTime() - template.weekStartDate.getTime())),
      _id: undefined
    }));
    
    return new this({
      employeeId,
      weekStartDate,
      weekEndDate,
      schedules: newSchedules,
      createdBy: template.createdBy
    });
  });
};

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule; 