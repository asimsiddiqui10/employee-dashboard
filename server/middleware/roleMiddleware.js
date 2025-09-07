const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'No user found' });
        }

        // Check both legacy role field and new roles array
        const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
        const activeRole = req.user.activeRole || req.user.role;

        if (userRoles.length === 0) {
            return res.status(403).json({ message: 'No role specified' });
        }

        // Check if user has any of the allowed roles
        const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));
        
        if (!hasAllowedRole) {
            return res.status(403).json({ 
                message: 'Unauthorized role',
                userRoles,
                allowedRoles,
                activeRole
            });
        }

        // Add role information to request for easy access
        req.userRoles = userRoles;
        req.activeRole = activeRole;
        req.hasRole = (role) => userRoles.includes(role);
        req.hasAnyRole = (roles) => roles.some(role => userRoles.includes(role));

        next();
    };
};

// New middleware for checking active role specifically
const activeRoleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'No user found' });
        }

        const activeRole = req.user.activeRole || req.user.role;
        
        if (!activeRole) {
            return res.status(403).json({ message: 'No active role specified' });
        }

        if (!allowedRoles.includes(activeRole)) {
            return res.status(403).json({ 
                message: 'Unauthorized active role',
                activeRole,
                allowedRoles
            });
        }

        req.activeRole = activeRole;
        next();
    };
};

export { roleMiddleware, activeRoleMiddleware }; 