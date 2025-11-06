import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { User } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    fetchProfilePic();
  }, []);

  const fetchProfilePic = async () => {
    try {
      const response = await api.get('/employees/me');
      const employee = response.data;
      
      if (employee && employee.profilePic) {
        setProfilePic(employee.profilePic);
      }
    } catch (error) {
      // Silently fail - fallback icon will show
    }
  };
  
  return (
    <nav className="border-b border-gray-200 bg-white py-3 px-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex-1" />
        
        <div className="text-center flex-1">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">American Completion Tools</h1>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-3">
            {/* Role Switcher */}
            <RoleSwitcher />
            
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={profilePic} 
                alt={user?.name || 'User'} 
              />
              <AvatarFallback className="bg-gray-100">
                <User className="h-5 w-5 text-gray-600" />
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={logout}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;