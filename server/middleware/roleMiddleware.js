const roleMiddleware = (requiredRole) => (req, res, next) => {
  if (req.user && req.user.role === requiredRole) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
};

module.exports = roleMiddleware; 