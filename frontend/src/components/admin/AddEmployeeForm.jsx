import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { departments } from '@/lib/departments';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AddEmployeeForm = ({ onClose, onSubmit }) => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({
    // Required fields from Employee model
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
    gender: '',
    maritalStatus: '',
    ssn: '',
    department: '',
    position: '',
    employmentType: '',
    employmentStatus: 'Active',
    compensationType: 'Monthly Salary',
    compensationValue: '',
    // Flag for admin creation
    isAdmin: false,

    // Leave configuration
    leaveSummary: {
      totalLeaves: 20,
      leavesTaken: 0,
      leavesApproved: 0,
      leavesRejected: 0,
      leavesRemaining: 20
    },

    // Optional fields
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    nationality: '',
    educationLevel: '',
    certifications: '',
    jobTitle: '',
    jobDescription: '',
    dateOfHire: '',
    workEmail: '',
    workPhoneNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isAdmin') {
      setIsAdmin(checked);
      setForm(prev => ({ 
        ...prev, 
        isAdmin: checked,
        // Clear employee-specific fields if creating admin
        ...(checked && {
          employeeId: '',
          ssn: '',
          department: '',
          position: '',
          employmentType: '',
          compensationType: '',
          compensationValue: ''
        })
      }));
      return;
    }

    if (name.includes('leaveSummary')) {
      const field = name.split('.')[1];
      const numValue = parseInt(value) || 0;

      setForm(prev => {
        const newLeaveSummary = { ...prev.leaveSummary };

        switch (field) {
          case 'totalLeaves':
            // When total leaves changes, adjust remaining leaves
            newLeaveSummary.totalLeaves = numValue;
            newLeaveSummary.leavesRemaining = numValue - newLeaveSummary.leavesTaken;
            break;
          case 'leavesTaken':
            // When taken leaves changes, adjust remaining leaves
            newLeaveSummary.leavesTaken = numValue;
            newLeaveSummary.leavesRemaining = newLeaveSummary.totalLeaves - numValue;
            break;
          case 'leavesRemaining':
            // When remaining leaves changes, adjust taken leaves
            newLeaveSummary.leavesRemaining = numValue;
            newLeaveSummary.leavesTaken = newLeaveSummary.totalLeaves - numValue;
            break;
        }

        // Ensure no negative values
        newLeaveSummary.leavesRemaining = Math.max(0, newLeaveSummary.leavesRemaining);
        newLeaveSummary.leavesTaken = Math.max(0, newLeaveSummary.leavesTaken);
        newLeaveSummary.totalLeaves = Math.max(newLeaveSummary.leavesTaken, newLeaveSummary.totalLeaves);

        return { ...prev, leaveSummary: newLeaveSummary };
      });
      return;
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Basic required fields for both admin and employee
    const basicFields = [
      { field: 'name', label: 'Name' },
      { field: 'email', label: 'Email' },
      { field: 'password', label: 'Password' },
    ];

    // Additional fields required only for employees
    const employeeFields = [
      { field: 'employeeId', label: 'Employee ID' },
      { field: 'gender', label: 'Gender' },
      { field: 'ssn', label: 'SSN' },
      { field: 'department', label: 'Department' },
      { field: 'position', label: 'Position' },
      { field: 'employmentType', label: 'Employment Type' },
      { field: 'compensationType', label: 'Compensation Type' },
      { field: 'compensationValue', label: 'Compensation Value' }
    ];

    const requiredFields = isAdmin ? basicFields : [...basicFields, ...employeeFields];
    const missingFields = requiredFields.filter(({ field }) => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Employee-specific validations
    if (!isAdmin) {
      // Validate SSN format (XXX-XX-XXXX)
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      if (!ssnRegex.test(form.ssn)) {
        setError('Please enter a valid SSN (XXX-XX-XXXX)');
        return false;
      }

      // Validate employment type
      const validEmploymentTypes = ['Full-time', 'Part-time', 'Contract', 'Hourly', 'Consultant'];
      if (!validEmploymentTypes.includes(form.employmentType)) {
        setError('Please select a valid employment type');
        return false;
      }

      // Validate gender
      const validGenders = ['Male', 'Female', 'Other'];
      if (!validGenders.includes(form.gender)) {
        setError('Please select a valid gender');
        return false;
      }

      // Validate compensation value
      if (isNaN(form.compensationValue) || Number(form.compensationValue) <= 0) {
        setError('Please enter a valid compensation value');
        return false;
      }
    }

    // Validate password
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    // Format the data for backend
    const formattedData = {
      ...form,
      compensationValue: isAdmin ? undefined : Number(form.compensationValue),
      certifications: form.certifications ? form.certifications.split(',').map(cert => cert.trim()) : [],
      // Ensure these fields match the backend enum values
      employmentStatus: form.employmentStatus || 'Active',
      role: isAdmin ? 'admin' : 'employee',
      // Format dates if present
      dateOfHire: form.dateOfHire || undefined,
      dateOfBirth: form.dateOfBirth || undefined
    };

    // Remove empty values but keep required fields
    const requiredFields = ['name', 'email', 'password', 'gender'];
    if (!isAdmin) {
      requiredFields.push('employeeId', 'ssn', 'department', 'position', 'employmentType');
    }

    Object.keys(formattedData).forEach(key => {
      // Don't remove required fields even if empty
      if (!requiredFields.includes(key) && (formattedData[key] === '' || formattedData[key] === undefined)) {
        delete formattedData[key];
      }
    });
    
    console.log('Submitting user data:', formattedData); // Debug log
    onSubmit(formattedData);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User Type Selection */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="isAdmin"
            name="isAdmin"
            checked={isAdmin}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
            Create as Administrator
          </label>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={form.name}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            {!isAdmin && (
              <input
                type="text"
                name="employeeId"
                placeholder="Employee ID *"
                value={form.employeeId}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password *"
                value={form.password}
                onChange={handleChange}
                className="p-2 border rounded w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Employee-specific fields */}
        {!isAdmin && (
          <>
            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="position"
                  placeholder="Position *"
                  value={form.position}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                />
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Department *</option>
                  {Object.entries(departments).map(([key, dept]) => (
                    <option key={key} value={key}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="Job Title"
                  value={form.jobTitle}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Employment Type *</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Hourly">Hourly</option>
                </select>
                <select
                  name="employmentStatus"
                  value={form.employmentStatus}
                  onChange={handleChange}
                  className="p-2 border rounded"
                >
                  <option value="Active">Active</option>
                  <option value="On leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
                <input
                  type="date"
                  name="dateOfHire"
                  placeholder="Date of Hire"
                  value={form.dateOfHire}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <select
                  name="compensationType"
                  value={form.compensationType}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                >
                  <option value="Monthly Salary">Monthly Salary</option>
                  <option value="Hourly Rate">Hourly Rate</option>
                  <option value="Total Compensation">Total Compensation</option>
                </select>
                <input
                  type="number"
                  name="compensationValue"
                  placeholder="Compensation Value *"
                  value={form.compensationValue}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                />
                <textarea
                  name="jobDescription"
                  placeholder="Job Description"
                  value={form.jobDescription}
                  onChange={handleChange}
                  className="p-2 border rounded col-span-2"
                  rows="3"
                />

                {/* Add Leave Configuration */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Leave Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalLeaves">Total Leave Days (Per Year)</Label>
                      <Input
                        id="totalLeaves"
                        name="leaveSummary.totalLeaves"
                        type="number"
                        value={form.leaveSummary.totalLeaves}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leavesRemaining">Initial Available Days</Label>
                      <Input
                        id="leavesRemaining"
                        name="leaveSummary.leavesRemaining"
                        type="number"
                        value={form.leaveSummary.leavesRemaining}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Gender *</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  name="ssn"
                  placeholder="SSN *"
                  value={form.ssn}
                  onChange={handleChange}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="nationality"
                  placeholder="Nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={form.zipCode}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="educationLevel"
                  placeholder="Education Level"
                  value={form.educationLevel}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="certifications"
                  placeholder="Certifications (comma-separated)"
                  value={form.certifications}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="emergencyContact.name"
                  placeholder="Emergency Contact Name"
                  value={form.emergencyContact.name}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="emergencyContact.phone"
                  placeholder="Emergency Contact Phone"
                  value={form.emergencyContact.phone}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isAdmin ? 'Create Administrator' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm; 