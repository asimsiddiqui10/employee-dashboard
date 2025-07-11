import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date,
    default: null
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
    }
  }],
  totalBreakTime: {
    type: Number, // Total break time in minutes
    default: 0
  },
  totalWorkTime: {
    type: Number, // Total work time in minutes (excluding breaks)
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Add index for efficient queries
timeEntrySchema.index({ employee: 1, date: 1 });

// Method to calculate total work time
timeEntrySchema.methods.calculateTotalTime = function() {
  if (!this.clockOut) return 0;
  
  const totalTime = Math.floor((this.clockOut - this.clockIn) / (1000 * 60)); // Convert to minutes
  this.totalWorkTime = totalTime - (this.totalBreakTime || 0);
  return this.totalWorkTime;
};

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);
export default TimeEntry; 