// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee', required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  picture: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  ssn: { type: String, required: true, unique: true },
  nationality: { type: String },
  educationLevel: { type: String },
  certifications: [String],
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
  },
  // Work Information
  department: { type: String },
  position: { type: String },
  dateOfHire: { type: Date },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employmentType: { type: String, enum: ['Part-time', 'Full-time', 'Contract', 'Consultant'] },
  employmentStatus: { type: String, enum: ['Active', 'On leave', 'Terminated'] },
  terminationDate: { type: Date },
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
  }
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
