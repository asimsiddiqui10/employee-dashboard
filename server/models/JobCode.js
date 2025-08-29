import mongoose from 'mongoose';

const jobCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxLength: 20
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['Labor', 'Equipment', 'Supervision', 'Administrative', 'Sales', 'Technical', 'Other'],
    default: 'Other'
  },
  defaultRate: {
    type: Number,
    min: 0,
    required: true
  },
  minRate: {
    type: Number,
    min: 0,
    default: 0
  },
  maxRate: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  department: {
    type: String,
    ref: 'Department',
    required: false
  },
  skills: [{
    type: String,
    trim: true,
    maxLength: 100
  }],
  requirements: {
    type: String,
    maxLength: 500
  },
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
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
jobCodeSchema.index({ code: 1 });
jobCodeSchema.index({ category: 1 });
jobCodeSchema.index({ isActive: 1 });
jobCodeSchema.index({ department: 1 });

// Pre-save middleware to ensure only one default job code
jobCodeSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // If this is being set as default, unset all others
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  
  // Increment version on each save
  this.version += 1;
  
  next();
});

// Pre-save middleware to validate rate constraints
jobCodeSchema.pre('save', function(next) {
  if (this.maxRate && this.minRate && this.maxRate < this.minRate) {
    return next(new Error('Maximum rate cannot be less than minimum rate'));
  }
  
  if (this.defaultRate < this.minRate) {
    return next(new Error('Default rate cannot be less than minimum rate'));
  }
  
  if (this.maxRate && this.defaultRate > this.maxRate) {
    return next(new Error('Default rate cannot exceed maximum rate'));
  }
  
  next();
});

// Static method to get default job code
jobCodeSchema.statics.getDefault = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// Static method to get active job codes by category
jobCodeSchema.statics.getActiveByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ code: 1 });
};

// Static method to get all active job codes
jobCodeSchema.statics.getAllActive = function() {
  return this.find({ isActive: true }).sort({ code: 1 });
};

// Static method to search job codes
jobCodeSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { code: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ],
    isActive: true
  }).sort({ code: 1 });
};

// Instance method to check if rate is valid for this job code
jobCodeSchema.methods.isValidRate = function(rate) {
  if (rate < this.minRate) return false;
  if (this.maxRate && rate > this.maxRate) return false;
  return true;
};

// Instance method to get suggested rate
jobCodeSchema.methods.getSuggestedRate = function() {
  if (this.maxRate && this.minRate) {
    return Math.round((this.maxRate + this.minRate) / 2 * 100) / 100;
  }
  return this.defaultRate;
};

const JobCode = mongoose.model('JobCode', jobCodeSchema);

export default JobCode; 