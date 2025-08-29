import mongoose from 'mongoose';

const jobCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: 20,
    uppercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  rate: {
    type: String,
    required: false,
    default: 'NA'
  },
  assignedTo: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    assignedRate: {
      type: String,
      required: false,
      default: 'NA'
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxLength: 500
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
jobCodeSchema.index({ code: 1 });
jobCodeSchema.index({ isActive: 1 });
jobCodeSchema.index({ isDefault: 1 });
jobCodeSchema.index({ 'assignedTo.employee': 1 });

// Pre-save middleware to ensure only one default job code and one primary assignment per job code
jobCodeSchema.pre('save', async function(next) {
  try {
    if (this.isDefault) {
      // If this job code is being set as default, unset all others
      await this.constructor.updateMany(
        { _id: { $ne: this._id } },
        { isDefault: false }
      );
    }
    
    // Ensure only one primary assignment per job code
    if (this.assignedTo && this.assignedTo.length > 0) {
      const primaryAssignments = this.assignedTo.filter(assignment => assignment.isPrimary);
      if (primaryAssignments.length > 1) {
        // Keep only the first primary assignment
        for (let i = 1; i < primaryAssignments.length; i++) {
          primaryAssignments[i].isPrimary = false;
        }
      }
    }
    
    // Ensure all required fields have default values
    if (this.rate === undefined) this.rate = 'NA';
    if (this.isActive === undefined) this.isActive = true;
    if (this.isDefault === undefined) this.isDefault = false;
    
    next();
  } catch (error) {
    console.error('Pre-save hook error:', error);
    next(error);
  }
});

// Static methods
jobCodeSchema.statics.getDefault = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

jobCodeSchema.statics.getAllActive = function() {
  return this.find({ isActive: true }).sort({ title: 1 });
};

// Instance methods
jobCodeSchema.methods.getRateDisplay = function() {
  return `$${this.rate}/hr`;
};

// Method to assign job code to an employee
jobCodeSchema.methods.assignToEmployee = function(employeeId, assignedRate = null, isPrimary = false, notes = '') {
  // Remove existing assignment if it exists
  this.assignedTo = this.assignedTo.filter(assignment => 
    assignment.employee.toString() !== employeeId.toString()
  );
  
  // Add new assignment
  this.assignedTo.push({
    employee: employeeId,
    assignedRate: assignedRate || this.rate,
    isPrimary,
    assignedDate: new Date(),
    notes
  });
  
  return this;
};

// Method to remove job code from an employee
jobCodeSchema.methods.removeFromEmployee = function(employeeId) {
  this.assignedTo = this.assignedTo.filter(assignment => 
    assignment.employee.toString() !== employeeId.toString()
  );
  return this;
};

// Method to get primary employee
jobCodeSchema.methods.getPrimaryEmployee = function() {
  const primaryAssignment = this.assignedTo.find(assignment => assignment.isPrimary);
  return primaryAssignment ? primaryAssignment.employee : null;
};

const JobCode = mongoose.model('JobCode', jobCodeSchema);

export default JobCode; 