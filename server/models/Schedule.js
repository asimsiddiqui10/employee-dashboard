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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  includeWeekends: {
    type: Boolean,
    default: false
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
  }
}, {
  timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ startDate: 1, endDate: 1 });
scheduleSchema.index({ employeeId: 1, startDate: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;

