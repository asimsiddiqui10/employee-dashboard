import React, { useState } from 'react';

const AddEmployeeModal = ({ employees, onClose, onSave }) => {
  const [form, setForm] = useState({
    employeeId: '',
    role: 'employee',
    name: '',
    gender: 'Male',
    picture: '',
    phoneNumber: '',
    dateOfBirth: '',
    email: '',
    address: '',
    ssn: '',
    nationality: '',
    educationLevel: '',
    certifications: '',
    emergencyContact: {
      name: '',
      phone: '',
    },
    department: '',
    position: '',
    dateOfHire: '',
    manager: '',
    employmentType: 'Full-time',
    employmentStatus: 'Active',
    terminationDate: '',
    workEmail: '',
    workPhoneNumber: '',
    totalCompensation: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm({
        ...form,
        [parent]: { ...form[parent], [child]: value }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.password) {
      alert('Password is required for new employees');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-lg w-1/2 max-h-[80vh] overflow-y-auto my-8">
        <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" name="employeeId" value={form.employeeId} onChange={handleInputChange} placeholder="Employee ID" required />
            <select className="border p-2 rounded" name="role" value={form.role} onChange={handleInputChange}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <input className="border p-2 rounded" name="name" value={form.name} onChange={handleInputChange} placeholder="Name" required />
            <select className="border p-2 rounded" name="gender" value={form.gender} onChange={handleInputChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input className="border p-2 rounded" name="picture" value={form.picture} onChange={handleInputChange} placeholder="Picture URL" />
            <input className="border p-2 rounded" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" />
            <input className="border p-2 rounded" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleInputChange} placeholder="Date of Birth" />
            <input className="border p-2 rounded" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" required />
            <input className="border p-2 rounded" name="address" value={form.address} onChange={handleInputChange} placeholder="Address" />
            <input className="border p-2 rounded" name="ssn" value={form.ssn} onChange={handleInputChange} placeholder="SSN" required />
            <input className="border p-2 rounded" name="nationality" value={form.nationality} onChange={handleInputChange} placeholder="Nationality" />
            <input className="border p-2 rounded" name="educationLevel" value={form.educationLevel} onChange={handleInputChange} placeholder="Education Level" />
            <input className="border p-2 rounded" name="certifications" value={form.certifications} onChange={handleInputChange} placeholder="Certifications" />
            <input className="border p-2 rounded" name="emergencyContact.name" value={form.emergencyContact.name} onChange={handleInputChange} placeholder="Emergency Contact Name" />
            <input className="border p-2 rounded" name="emergencyContact.phone" value={form.emergencyContact.phone} onChange={handleInputChange} placeholder="Emergency Contact Phone" />
            <input className="border p-2 rounded" name="department" value={form.department} onChange={handleInputChange} placeholder="Department" />
            <input className="border p-2 rounded" name="position" value={form.position} onChange={handleInputChange} placeholder="Position" />
            <input className="border p-2 rounded" name="dateOfHire" type="date" value={form.dateOfHire} onChange={handleInputChange} placeholder="Date of Hire" />
            <select className="border p-2 rounded" name="manager" value={form.manager} onChange={handleInputChange}>
              <option value="">Select Manager</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <select className="border p-2 rounded" name="employmentType" value={form.employmentType} onChange={handleInputChange}>
              <option value="Part-time">Part-time</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Consultant">Consultant</option>
            </select>
            <select className="border p-2 rounded" name="employmentStatus" value={form.employmentStatus} onChange={handleInputChange}>
              <option value="Active">Active</option>
              <option value="On leave">On leave</option>
              <option value="Terminated">Terminated</option>
            </select>
            <input className="border p-2 rounded" name="terminationDate" type="date" value={form.terminationDate} onChange={handleInputChange} placeholder="Termination Date" />
            <input className="border p-2 rounded" name="workEmail" value={form.workEmail} onChange={handleInputChange} placeholder="Work Email" />
            <input className="border p-2 rounded" name="workPhoneNumber" value={form.workPhoneNumber} onChange={handleInputChange} placeholder="Work Phone Number" />
            <input className="border p-2 rounded" name="totalCompensation" type="number" value={form.totalCompensation} onChange={handleInputChange} placeholder="Total Compensation" />
            <input className="border p-2 rounded" name="password" type="password" value={form.password} onChange={handleInputChange} placeholder="Password" required />
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              Add Employee
            </button>
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal; 