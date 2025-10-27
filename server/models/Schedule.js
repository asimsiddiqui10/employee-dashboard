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
  employeeName: {
    type: String,
    required: true
  },
  jobCode: {
    type: String,
    required: true,
    index: true
  },
  
  // Schedule type: pattern (recurring) or specific_dates (selected dates)
  scheduleType: {
    type: String,
    enum: ['pattern', 'specific_dates'],
    default: 'pattern',
    required: true
  },
  
  // For pattern-based schedules
  startDate: {
    type: Date,
    required: function() { return this.scheduleType === 'pattern'; }
  },
  endDate: {
    type: Date,
    required: function() { return this.scheduleType === 'pattern'; }
  },
  daysOfWeek: {
    type: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false }
    },
    default: function() {
      return this.scheduleType === 'pattern' ? {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      } : undefined;
    }
  },
  
  // For specific date selections
  specificDates: {
    type: [{
      date: { type: Date, required: true },
      enabled: { type: Boolean, default: true }
    }],
    default: []
  },
  
  // Dates to exclude from pattern-based schedules (for editing specific days)
  excludedDates: {
    type: [Date],
    default: []
  },
  
  hoursPerDay: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  
  // Track if this was created from splitting/editing another schedule
  parentSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  }
}, {
  timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ startDate: 1, endDate: 1 });
scheduleSchema.index({ employeeId: 1, startDate: 1 });
scheduleSchema.index({ 'specificDates.date': 1 });
scheduleSchema.index({ scheduleType: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;

