import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';
import EmployeeSummary from '../components/employee/EmployeeSummary';
import Payroll from '../components/employee/Payroll';
import Leave from '../components/employee/Leave';
import Notifications from '../components/employee/Notifications';
import Settings from '../components/employee/Settings';

const EmployeeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="relative">
                <button className="flex items-center text-gray-500 focus:outline-none">
                  <span className="mr-2 text-sm font-medium">Employee</span>
                  <img className="h-8 w-8 rounded-full object-cover" src="https://via.placeholder.com/150" alt="Profile" />
                </button>
                <button onClick={handleLogout} className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
