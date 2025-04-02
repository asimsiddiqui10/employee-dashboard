import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, LogOut, Bell, Calendar, DollarSign, GraduationCap, Settings } from 'lucide-react'; // Update imports
import { useAuth } from '../../context/authContext';

const EmployeeSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="space-y-4">
        <NavLink
          to="/employee-dashboard"
          end
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/employee-dashboard/my-details"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          <User size={20} />
          <span>My Details</span>
        </NavLink>

        <NavLink
          to="/employee-dashboard/notifications"
          className="flex items-center p-2 hover:bg-gray-700 rounded"
        >
          <Bell size={20} className="mr-2" />
          Notifications
        </NavLink>

        <NavLink
          to="/employee-dashboard/leave"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          <Calendar size={20} />
          <span>Leave</span>
        </NavLink>

        <NavLink
          to="/employee-dashboard/payroll"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          <DollarSign size={20} />
          <span>Payroll</span>
        </NavLink>

        <NavLink
          to="/employee-dashboard/training"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          <GraduationCap size={20} />
          <span>Training</span>
        </NavLink>

        <NavLink
          to="/employee-dashboard/settings"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-gray-900' : 'hover:bg-gray-700'
            }`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default EmployeeSidebar;