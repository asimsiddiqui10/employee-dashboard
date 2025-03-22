import React from 'react'
import { useAuth } from '../context/authContext';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const {user} = useAuth();

  return (  
    <div className='flex'>
      <AdminSidebar/>
      <div className='flex-1 p-4'>
        <Navbar/>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminDashboard;