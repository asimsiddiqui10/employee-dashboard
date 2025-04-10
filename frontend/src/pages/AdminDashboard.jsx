import React from 'react'
import { useAuth } from '../context/authContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import Navbar from '../components/common/Navbar';
import { Outlet } from 'react-router-dom';
import EmployeeList from '../components/admin/EmployeeList';
import AdminHome from '../components/admin/AdminHome';
import LeaveManagement from '../components/admin/LeaveManagement';




const AdminDashboard = () => {
  const {user} = useAuth();

  return (
    <div className='flex'>
      <AdminSidebar/>
      <main className='flex-1 p-4 ml-56'> {/* Changed from ml-64 to ml-56 */}
        <Navbar/>
        <Outlet/>
      </main>
    </div>
  )
}

export default AdminDashboard;