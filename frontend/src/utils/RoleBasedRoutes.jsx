import React from 'react';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

const RoleBasedRoutes = ({children, requiredRole}) => {
    const {user, loading} = useAuth();

    console.log("User:", user);
    console.log("Required Role:", requiredRole);

    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (!requiredRole || !user.role || !requiredRole.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}

export default RoleBasedRoutes;