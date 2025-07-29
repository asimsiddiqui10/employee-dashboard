import mongoose from 'mongoose';

const punchEntrySchema = new mongoose.Schema({
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
  punchIn: {
    type: Date,
    required: true
  },
  punchOut: {
    type: Date,
    default: null
  },
  totalWorkTime: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Calculate total work time when punch out is set
punchEntrySchema.methods.calculateTotalTime = function() {
  if (this.punchOut && this.punchIn) {
    const diffInMs = this.punchOut - this.punchIn;
    this.totalWorkTime = Math.floor(diffInMs / (1000 * 60)); // Convert to minutes
  }
  return this.totalWorkTime;
};

// Pre-save middleware to calculate total time
punchEntrySchema.pre('save', function(next) {
  if (this.punchOut && this.punchIn) {
    this.calculateTotalTime();
  }
  next();
});

const PunchEntry = mongoose.model('PunchEntry', punchEntrySchema);
export default PunchEntry; 