import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const navigate = useNavigate();

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

  const handleAddEmployee = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/employees', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShowAddModal(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleViewDetails = (employee) => {
    navigate(`/admin-dashboard/employees/${employee.employeeId}`);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/employees/${employeeToDelete.employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEmployeeToDelete(null);
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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employee List</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Position</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Status</th>
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
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.employmentStatus === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : employee.employmentStatus === 'On leave'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.employmentStatus}
                  </span>
                </td>
                <td className="px-4 py-2 text-center flex gap-1 justify-center">
                  <button 
                    onClick={() => handleViewDetails(employee)} 
                    className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(employee)} 
                    className="bg-gray-300 text-white px-2 py-1 text-xs rounded hover:bg-gray-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          employees={employees}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEmployee}
        />
      )}

      {employeeToDelete && (
        <DeleteConfirmationModal
          employee={employeeToDelete}
          onClose={() => setEmployeeToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default EmployeeList;
