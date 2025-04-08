import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';
import Navbar from '../components/common/Navbar';
import LeaveRequest from '../components/employee/LeaveRequest'; 

const EmployeeDashboard = () => {
  return (
    <div className="flex h-screen">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
