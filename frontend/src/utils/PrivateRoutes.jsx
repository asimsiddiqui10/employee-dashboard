import React from 'react';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

// Private route wrapper with optional kiosk allowance.
// By default, kiosk sessions are blocked from protected areas
// like admin/employee dashboards.
const PrivateRoutes = ({ children, allowKiosk = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isKioskSession = localStorage.getItem('kioskSession') === 'true';

  // If this is a kiosk session and the route does not explicitly allow kiosk,
  // force re-authentication.
  if (isKioskSession && !allowKiosk) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoutes;