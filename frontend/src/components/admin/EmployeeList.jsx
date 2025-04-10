import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, User } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr 
                key={employee._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetails(employee)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {employee.profilePic ? (
                        <img
                          src={`http://localhost:3000${employee.profilePic}`}
                          alt={employee.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.employeeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.email}</div>
                  <div className="text-sm text-gray-500">{employee.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(employee);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(employee);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeList;
