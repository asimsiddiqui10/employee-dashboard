const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'No role specified' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        next();
    };
};

export { roleMiddleware }; 