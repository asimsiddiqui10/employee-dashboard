import mongoose from 'mongoose';

const companyDefaultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  schedule: {
    monday: {
      enabled: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 8.0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    },
    tuesday: {
      enabled: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 8.0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    },
    wednesday: {
      enabled: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 8.0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    },
    thursday: {
      enabled: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 8.0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    },
    friday: {
      enabled: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 8.0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    },
    saturday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    },
    sunday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      hours: { type: Number, default: 0 },
      breaks: [{
        startTime: String,
        endTime: String,
        duration: Number,
        description: String
      }]
    }
  },
  defaultJobCode: {
    type: String,
    required: true,
    default: 'ACT001'
  },
  defaultRate: {
    type: Number,
    required: true,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

// Indexes
companyDefaultSchema.index({ isActive: 1, isDefault: 1 });
companyDefaultSchema.index({ name: 1 });

// Pre-save middleware to ensure only one default
companyDefaultSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Static method to get default company schedule
companyDefaultSchema.statics.getDefault = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// Static method to get all active company defaults
companyDefaultSchema.statics.getAllActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

const CompanyDefault = mongoose.model('CompanyDefault', companyDefaultSchema);

export default CompanyDefault; 