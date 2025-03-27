import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        // Check if Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'No authorization header' });
        }

        // Get token from header
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        
        // Find user
        const user = await User.findById(decoded._id)
            .select('-password')
            .populate('employee'); // This will populate the employee data if needed

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export default authMiddleware;