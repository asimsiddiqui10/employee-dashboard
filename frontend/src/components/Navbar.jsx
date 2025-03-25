import React from 'react';
import { useAuth } from '../context/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="border-b border-gray-200 bg-white py-3 px-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-xl font-semibold text-gray-900">American Completion Tools</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</p>
          <button 
            onClick={() => {
              logout();
            }}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;