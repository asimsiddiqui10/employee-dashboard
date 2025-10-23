import mongoose from 'mongoose';

const scheduleTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  jobCode: {
    type: String,
    required: false, // Not compulsory as per requirement
    index: true
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
    default: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
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
  isActive: {
    type: Boolean,
    default: true
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
scheduleTemplateSchema.index({ name: 1 });
scheduleTemplateSchema.index({ isActive: 1 });

const ScheduleTemplate = mongoose.model('ScheduleTemplate', scheduleTemplateSchema);

export default ScheduleTemplate;

