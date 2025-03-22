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
        <div className="h-screen w-64 bg-slate-900 text-slate-50 p-4 flex flex-col"> 
            <div className="mb-6">
                <h3 className="text-xl font-semibold px-4 py-2">Admin Panel</h3>
            </div>
            <div className="space-y-1">
                <NavLink 
                    to="/admin/dashboard" 
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/admin/employees" 
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Users size={18} />
                    <span>Employees</span>
                </NavLink>
                <NavLink 
                    to="/admin/departments" 
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Building2 size={18} />
                    <span>Department</span>
                </NavLink>
                <NavLink 
                    to="/admin/leave" 
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Calendar size={18} />
                    <span>Leave</span>
                </NavLink>
                <NavLink 
                    to="/admin/salary" 
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <DollarSign size={18} />
                    <span>Salary</span>
                </NavLink>
                <NavLink 
                    to="/admin/settings" 
                    className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-slate-800 text-slate-50' 
                                : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                        }`
                    }
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </div>
    )   
}

export default AdminSidebar;