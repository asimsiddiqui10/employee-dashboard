import mongoose from 'mongoose';

const payrollCalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  payDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'current', 'completed'],
    default: 'upcoming'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
payrollCalendarSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PayrollCalendar = mongoose.model('PayrollCalendar', payrollCalendarSchema);
export default PayrollCalendar; 