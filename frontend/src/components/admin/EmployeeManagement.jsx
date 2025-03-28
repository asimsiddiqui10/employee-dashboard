import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeList from './EmployeeList';
import AddEmployeeModal from './AddEmployeeModal';

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
  const [showAddModal, setShowAddModal] = useState(false);

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
      const token = localStorage.getItem('token');
      if (editing) {
        // Handle editing (exclude password if not changed)
        const { password, ...dataWithoutPassword } = form;
        const data = password ? form : dataWithoutPassword;
        
        await axios.put(`http://localhost:3000/api/employees/${form.employeeId}`, data, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // For new employees, password is required
        if (!form.password) {
          alert('Password is required for new employees');
          return;
        }
        await axios.post('http://localhost:3000/api/employees', form, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setShowAddModal(false);
      setForm({
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
      fetchEmployees();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred');
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

  const handleAddEmployee = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/employees', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShowAddModal(false);
      // Refresh the employee list
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <EmployeeList />
      </div>
      <div className="w-full p-6 bg-white shadow-md rounded-lg mb-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Add Employee
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          employees={employees}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;