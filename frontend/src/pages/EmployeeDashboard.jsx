import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';
import Navbar from '../components/common/Navbar';

const EmployeeDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-6">
          {/* Main content area, currently empty */}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
