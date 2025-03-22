import React from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null; // Return null while redirecting
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Employee Dashboard</h1>
      <p>Welcome, {user && user.name}</p>
      {/* Add your employee dashboard content here */}
    </div>
  );
};

export default EmployeeDashboard;
