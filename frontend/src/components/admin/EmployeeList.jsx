import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees from API...');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('API response:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setIsEditing(false);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
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
      console.error('Error deleting employee:', error);
    }
  };

  const handleSaveChanges = async (updatedEmployee) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/employees/${updatedEmployee.employeeId}`, updatedEmployee, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchEmployees();
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  return (
    <div className="w-full p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Employee List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employeeId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{employee.employeeId}</td>
                <td className="px-4 py-2">{employee.name}</td>
                <td className="px-4 py-2">{employee.department}</td>
                <td className="px-4 py-2">{employee.position}</td>
                <td className="px-4 py-2">{employee.email}</td>
                <td className="px-4 py-2">{employee.phoneNumber}</td>
                <td className="px-4 py-2 text-center flex gap-1 justify-center">
                  <button onClick={() => handleViewDetails(employee)} className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600">
                    View Details
                  </button>
                  <button onClick={() => handleEdit(employee)} className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(employee.employeeId)} className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          isEditing={isEditing}
          onClose={() => setSelectedEmployee(null)}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default EmployeeList;
