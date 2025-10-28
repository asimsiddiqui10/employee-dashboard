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
  date: {
    type: Date,
    required: true
  },
  jobCode: {
    type: String,
    required: true,
    index: true
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

// Indexes for performance and conflict detection
scheduleSchema.index({ employeeId: 1, date: 1 }); // Employee schedules
scheduleSchema.index({ date: 1 }); // Date-based queries
scheduleSchema.index({ employeeId: 1, date: 1, startTime: 1, endTime: 1 }); // Time conflict detection
scheduleSchema.index({ createdBy: 1 }); // Admin queries

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;

