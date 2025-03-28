import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';

const MyDetails = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/employees/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEmployeeDetails(response.data);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [user._id]);

  if (!employeeDetails) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">My Details</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Basic Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Employee ID</p>
              <p className="font-medium">{employeeDetails.employeeId}</p>
            </div>
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{employeeDetails.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{employeeDetails.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone Number</p>
              <p className="font-medium">{employeeDetails.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3">Employment Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Department</p>
              <p className="font-medium">{employeeDetails.department}</p>
            </div>
            <div>
              <p className="text-gray-600">Position</p>
              <p className="font-medium">{employeeDetails.position}</p>
            </div>
            <div>
              <p className="text-gray-600">Employment Type</p>
              <p className="font-medium">{employeeDetails.employmentType}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">{employeeDetails.employmentStatus}</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-medium">
                {new Date(employeeDetails.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-medium">{employeeDetails.address}</p>
            </div>
            <div>
              <p className="text-gray-600">Emergency Contact</p>
              <p className="font-medium">
                {employeeDetails.emergencyContact?.name} ({employeeDetails.emergencyContact?.phone})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDetails; 