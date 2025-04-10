import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddEmployeeModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    position: '',
    department: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    employmentType: '',
    dateOfHire: '',
    workEmail: '',
    workPhoneNumber: '',
    emergencyContact: {
      name: '',
      phone: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Employee</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="col-span-2 p-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Personal Email"
                value={form.email}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="employeeId"
                placeholder="Employee ID"
                value={form.employeeId}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              />
              <input
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="p-2 border rounded"
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Work Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={form.position}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              />
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              >
                <option value="">Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
              <input
                type="date"
                name="dateOfHire"
                placeholder="Date of Hire"
                value={form.dateOfHire}
                onChange={handleChange}
                className="p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="col-span-2 p-2 border rounded"
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
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
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
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
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

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal; 