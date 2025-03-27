import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
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

    fetchEmployees();
  }, []);
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
                  <button className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600">
                    View Details
                  </button>
                  <button className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600">
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
