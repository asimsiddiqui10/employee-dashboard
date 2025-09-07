// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], required: true }, // Legacy field for backward compatibility
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
  profileImage: { type: String },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add middleware to synchronize roles and handle backward compatibility
userSchema.pre('save', function(next) {
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
userSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

userSchema.methods.hasAnyRole = function(rolesArray) {
  return this.roles && rolesArray.some(role => this.roles.includes(role));
};

userSchema.methods.hasAllRoles = function(rolesArray) {
  return this.roles && rolesArray.every(role => this.roles.includes(role));
};

userSchema.methods.switchRole = function(newRole) {
  if (this.hasRole(newRole)) {
    this.activeRole = newRole;
    return true;
  }
  return false;
};

userSchema.methods.addRole = function(role) {
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

userSchema.methods.removeRole = function(role) {
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

const User = mongoose.model('User', userSchema);
export default User;