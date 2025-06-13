// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  // Basic Information
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee', required: true },
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
    enum: ['Engineering', 'Production', 'Administration', 'Management', 'Sales', 'Other'],
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
  employmentType: { type: String, enum: ['Part-time', 'Full-time', 'Contract', 'Hourly'] },
  employmentStatus: { type: String, enum: ['Active', 'On leave', 'Terminated'] },
  terminationDate: { type: Date },
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

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
