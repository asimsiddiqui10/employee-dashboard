import React from 'react'
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';


const AdminDashboard = () => {
  const {user, loading} = useAuth();
  const navigate = useNavigate();
  if (!user) {
    navigate('/login');
  }
  if (loading) {
    return <div>Loading...</div>;
  }

  return (  
    <div>AdminDashboard {user && user.name}</div>
  )
}

export default AdminDashboard;