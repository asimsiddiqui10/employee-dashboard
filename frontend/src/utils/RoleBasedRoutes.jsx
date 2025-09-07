import React from 'react';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

const RoleBasedRoutes = ({children, requiredRole, checkActiveRole = false}) => {
    const {user, loading} = useAuth();

    console.log("User:", user);
    console.log("Required Role:", requiredRole);
    console.log("User Roles:", user?.roles);
    console.log("Active Role:", user?.activeRole);

    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    // If no role requirements specified, allow access
    if (!requiredRole || requiredRole.length === 0) {
        return children;
    }

    // Helper functions for role checking
    const hasAnyRole = (roles) => {
        if (!user) return false;
        const userRoles = user.roles || (user.role ? [user.role] : []);
        return roles.some(role => userRoles.includes(role));
    };

    const getActiveRole = () => {
        if (!user) return null;
        return user.activeRole || user.role || (user.roles && user.roles[0]);
    };

    // Check role access based on the checkActiveRole flag
    let hasAccess = false;
    
    if (checkActiveRole) {
        // Check only the active role
        const activeRole = getActiveRole();
        hasAccess = activeRole && requiredRole.includes(activeRole);
    } else {
        // Check any of the user's roles (default behavior)
        hasAccess = hasAnyRole(requiredRole);
        
        // Backward compatibility: also check legacy role field
        if (!hasAccess && user.role) {
            hasAccess = requiredRole.includes(user.role);
        }
    }
    
    if (!hasAccess) {
        console.log("Access denied:", {
            requiredRole,
            userRoles: user.roles,
            activeRole: getActiveRole(),
            legacyRole: user.role,
            checkActiveRole
        });
        return <Navigate to="/unauthorized" />;
    }

    return children;
}

export default RoleBasedRoutes;