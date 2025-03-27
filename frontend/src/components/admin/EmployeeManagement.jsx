import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await axios.get('http://localhost:3000/api/employees');
      console.log('Employees fetched:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error.response || error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('emergencyContact')) {
      const [_, field] = name.split('.');
      setForm({
        ...form,
        emergencyContact: { ...form.emergencyContact, [field]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting employee data:', form);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (editing) {
        await axios.put(`http://localhost:3000/api/employees/${form.employeeId}`, form, config);
      } else {
        const response = await axios.post('http://localhost:3000/api/employees', form, config);
        console.log('Server response:', response.data);
      }
      fetchEmployees();
      setForm({
        email: '',
        password: '',
        name: '',
        role: 'employee',
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving employee:', error.response || error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }
  };

  const handleEdit = (employee) => {
    setForm(employee);
    setEditing(true);
  };

  const handleDelete = async (employeeId) => {
    try {
      console.log('Deleting employee:', employeeId);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error.response || error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <select
            className="border p-2 rounded"
            name="manager"
            value={form.manager}
            onChange={handleInputChange}
          >
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
          <input className="border p-2 rounded" name="password" value={form.password} onChange={handleInputChange} placeholder="Password" required={!editing} />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">{editing ? 'Update' : 'Add'} Employee</button>
      </form>
      <ul className="mt-6 space-y-2">
        {employees.map((employee) => (
          <li key={employee.employeeId} className="flex justify-between items-center p-2 border rounded">
            <span>{employee.name} - {employee.email}</span>
            <div>
              <button onClick={() => handleEdit(employee)} className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600">Edit</button>
              <button onClick={() => handleDelete(employee.employeeId)} className="bg-red-500 text-white p-1 rounded hover:bg-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeManagement; 