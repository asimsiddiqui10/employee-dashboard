import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  Settings 
} from 'lucide-react';

const AdminSidebar = () => {
    return (
        <div className="h-screen w-64 bg-slate-900 text-slate-50 p-4 flex flex-col overflow-y-auto max-w-full md:w-64 sm:w-56 xs:w-48"> 
            <div className="mb-6">
                <h3 className="text-sm md:text-base font-semibold px-4 py-2 truncate">Admin Dashboard</h3>
            </div>
            <div className="space-y-1">
                <NavLink 
                    to="/admin-dashboard" 
                    end
                    className={({ isActive }) => 
                        `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    } 
                >
                    <LayoutDashboard size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm md:text-base">Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/admin-dashboard/employees" 
                    className={({ isActive }) => 
                        `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Users size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm md:text-base">Employees</span>
                </NavLink>
                <NavLink 
                    to="/admin-dashboard/departments" 
                    className={({ isActive }) => 
                        `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Building2 size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm md:text-base">Department</span>
                </NavLink>
                <NavLink 
                    to="/admin-dashboard/leave" 
                    className={({ isActive }) => 
                        `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Calendar size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm md:text-base">Leave</span>
                </NavLink>
                <NavLink 
                    to="/admin-dashboard/salary" 
                    className={({ isActive }) => 
                        `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <DollarSign size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm md:text-base">Salary</span>
                </NavLink>
                <NavLink 
                    to="/admin-dashboard/settings" 
                    className={({ isActive }) => 
                        `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Settings size={16} className="flex-shrink-0" />
                    <span className="truncate text-sm md:text-base">Settings</span>
                </NavLink>
            </div>
        </div>
    )   
}

export default AdminSidebar;