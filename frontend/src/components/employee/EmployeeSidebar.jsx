import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, LogOut, Bell } from 'lucide-react'; // Import icons
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

      </div>
    </div>
  );
};

export default EmployeeSidebar;