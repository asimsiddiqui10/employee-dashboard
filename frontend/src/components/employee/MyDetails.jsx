import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { User } from 'lucide-react';

const MyDetails = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/employees/${user.employee}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployeeDetails(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  if (!employeeDetails) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header Section with Photo, Name, and Job Info */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
        <div className="absolute -bottom-16 left-8 flex items-end">
          {employeeDetails.profilePic ? (
            <img
              src={employeeDetails.profilePic}
              alt={employeeDetails.name}
              className="w-32 h-32 rounded-full border-4 border-white bg-white"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
              <User size={64} className="text-gray-400" />
            </div>
          )}
          <div className="ml-4 mb-4 text-white">
            <h1 className="text-2xl font-bold">{employeeDetails.name}</h1>
            <p className="text-sm opacity-90">{employeeDetails.position} at {employeeDetails.department}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 p-8">
        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="font-medium">{employeeDetails.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{employeeDetails.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-medium">{employeeDetails.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">
                {employeeDetails.dateOfBirth ? new Date(employeeDetails.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{employeeDetails.gender || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nationality</p>
              <p className="font-medium">{employeeDetails.nationality || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Work Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium">{employeeDetails.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{employeeDetails.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="font-medium">{employeeDetails.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Hire</p>
              <p className="font-medium">
                {employeeDetails.dateOfHire ? new Date(employeeDetails.dateOfHire).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{employeeDetails.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-medium">{employeeDetails.city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">State</p>
              <p className="font-medium">{employeeDetails.state || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{employeeDetails.emergencyContact?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{employeeDetails.emergencyContact?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDetails; 