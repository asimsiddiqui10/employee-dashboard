import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DollarSign, 
  Calendar, 
  Bell, 
  Settings 
} from 'lucide-react';

const EmployeeSidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/employee-dashboard', icon: LayoutDashboard },
    { name: 'Payroll', path: '/employee-dashboard/payroll', icon: DollarSign },
    { name: 'Leave', path: '/employee-dashboard/leave', icon: Calendar },
    { name: 'Notifications', path: '/employee-dashboard/notifications', icon: Bell },
    { name: 'Settings', path: '/employee-dashboard/settings', icon: Settings },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <h1 className={`text-xl font-bold transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>
          Employee
        </h1>
        <button onClick={toggleSidebar} className="p-2 rounded-md md:hidden focus:outline-none focus:bg-slate-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                end={item.path === '/employee-dashboard'}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default EmployeeSidebar; 