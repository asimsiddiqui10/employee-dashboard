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
  schedules: [{
    date: {
      type: mongoose.Schema.Types.Mixed, // Allow both String and Date
      required: true,
      set: function(val) {
        // If it's a string, keep it as is; if it's a Date, convert to string
        if (typeof val === 'string') {
          return val;
        } else if (val instanceof Date) {
          return val.toISOString().split('T')[0];
        }
        return val;
      }
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
      type: mongoose.Schema.Types.Mixed, // Allow both String and Number
      default: 'NA',
      validate: {
        validator: function(v) {
          // Allow 'NA' string or positive numbers
          return v === 'NA' || (typeof v === 'number' && v >= 0);
        },
        message: 'Rate must be "NA" or a positive number'
      }
    },
    isBreak: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      maxLength: 500
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  notes: {
    type: String,
    maxLength: 500
  }
});

// Basic indexes for performance
scheduleSchema.index({ employee: 1 });
scheduleSchema.index({ employeeId: 1 });
scheduleSchema.index({ 'schedules.date': 1, employeeId: 1 });
scheduleSchema.index({ 'schedules.jobCode': 1, employeeId: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule; 