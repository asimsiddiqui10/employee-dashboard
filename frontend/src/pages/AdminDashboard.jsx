import React from 'react'
import { useAuth } from '../context/authContext';
import AdminSidebar from '../components/AdminSidebar';


const AdminDashboard = () => {
  const {user, loading} = useAuth();
  
  return (  
    <div>
      <AdminSidebar/>
    </div>
  )
}

export default AdminDashboard;