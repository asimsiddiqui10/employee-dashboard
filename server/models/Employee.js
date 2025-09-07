// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee', required: true }, // Legacy field for backward compatibility
  roles: { 
    type: [String], 
    enum: ['admin', 'employee'], 
    default: function() { return [this.role || 'employee']; }
  }, // New field for multiple roles
  activeRole: { 
    type: String, 
    enum: ['admin', 'employee'], 
    default: function() { return this.role || 'employee'; }
  }, // Current active role for session
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated' , 'Other'] },
  profilePic: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  email: { type: String, required: true, unique: true },

  // Personal Information
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  ssn: { type: String, required: true, unique: true },
  nationality: { type: String },
  educationLevel: { type: String },
  certifications: [String],
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
  },
  // Work Information
  department: { 
    type: String,
    enum: ['Engineering', 'Production', 'Administration', 'Management', 'Sales', 'Warehouse', 'Manufacturing', 'WellServices', 'Operations', 'Admin', 'Other'],
    required: true 
  },
  position: { type: String },
  jobTitle: { type: String },
  jobDescription: { type: String }, 
  dateOfHire: { type: Date },
  supervisor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    default: null
  },
  employmentType: { 
    type: String, 
    enum: ['Full-time/Part-time', 'Contract/Hourly'],
    default: 'Full-time/Part-time' // Default for backward compatibility
  },
  employmentStatus: { 
    type: String, 
    enum: ['Active', 'On leave', 'Terminated'], 
    default: 'Active' 
  },
  terminationDate: { 
    type: Date,
    default: null
  },
  terminationReason: {
    type: String,
    default: null
  },
  exportCode: { type: String },
  workEmail: { type: String },
  workPhoneNumber: { type: String },
  compensationType: { 
    type: String, 
    enum: ['Monthly Salary', 'Hourly Rate', 'Total Compensation'],
    required: true 
  },
  compensationValue: { 
    type: Number,
    required: true 
  },
  // Job Code Information
  primaryJobCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCode',
    default: null
  },
  defaultHourlyRate: {
    type: Number,
    min: 0,
    default: 25.00
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  leaveSummary: {
    totalLeaves: { type: Number, default: 20 },
    leavesTaken: { type: Number, default: 0 },
    leavesApproved: { type: Number, default: 0 },
    leavesRejected: { type: Number, default: 0 },
    leavesRemaining: { type: Number, default: 20 }
  },
});

// Add middleware to synchronize roles and handle backward compatibility
employeeSchema.pre('save', function(next) {
  // Handle termination date
  if (this.isModified('employmentStatus')) {
    if (this.employmentStatus === 'Terminated' && !this.terminationDate) {
      this.terminationDate = new Date();
    } else if (this.employmentStatus !== 'Terminated') {
      this.terminationDate = null;
      this.terminationReason = null;
    }
  }

  // Synchronize role and roles fields for backward compatibility
  if (this.isModified('role') && this.role) {
    // If role is modified, ensure it's included in roles array
    if (!this.roles || !this.roles.includes(this.role)) {
      this.roles = this.roles ? [...new Set([...this.roles, this.role])] : [this.role];
    }
    // Set activeRole to the primary role if not set
    if (!this.activeRole) {
      this.activeRole = this.role;
    }
  }

  // If roles is modified, ensure role field reflects the primary role
  if (this.isModified('roles') && this.roles && this.roles.length > 0) {
    // Set role to first role in array if not set
    if (!this.role) {
      this.role = this.roles[0];
    }
    // Ensure activeRole is valid
    if (!this.activeRole || !this.roles.includes(this.activeRole)) {
      this.activeRole = this.roles.includes(this.role) ? this.role : this.roles[0];
    }
  }

  next();
});

// Add instance methods for role management
employeeSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

employeeSchema.methods.hasAnyRole = function(rolesArray) {
  return this.roles && rolesArray.some(role => this.roles.includes(role));
};

employeeSchema.methods.hasAllRoles = function(rolesArray) {
  return this.roles && rolesArray.every(role => this.roles.includes(role));
};

employeeSchema.methods.switchRole = function(newRole) {
  if (this.hasRole(newRole)) {
    this.activeRole = newRole;
    return true;
  }
  return false;
};

employeeSchema.methods.addRole = function(role) {
  if (!this.roles) this.roles = [];
  if (!this.roles.includes(role)) {
    this.roles.push(role);
    // If this is the first role, set it as primary
    if (!this.role) {
      this.role = role;
      this.activeRole = role;
    }
  }
};

employeeSchema.methods.removeRole = function(role) {
  if (this.roles) {
    this.roles = this.roles.filter(r => r !== role);
    // If removed role was the primary role, update it
    if (this.role === role && this.roles.length > 0) {
      this.role = this.roles[0];
    }
    // If removed role was the active role, switch to primary
    if (this.activeRole === role) {
      this.activeRole = this.role;
    }
  }
};

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
