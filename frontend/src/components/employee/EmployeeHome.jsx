import React from 'react';
import { useAuth } from '../../context/authContext';

const EmployeeHome = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}!</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome to your employee dashboard. Use the sidebar navigation to access your information and manage your profile.
        </p>
      </div>
    </div>
  );
};

export default EmployeeHome; 