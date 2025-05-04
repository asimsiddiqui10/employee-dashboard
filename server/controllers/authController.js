import User from '../models/User.js';
import Employee from '../models/Employee.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        // Get employee details if they exist
        const employee = await Employee.findOne({ user: user._id });

        // Create token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role,
                employeeId: employee?._id 
            },
            process.env.JWT_KEY,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: employee?._id
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during login',
            message: error.message
        });
    }
};

export const verify = async (req, res) => {
    try {
        // The user is already attached to req by the authMiddleware
        const user = req.user;
        
        // Get employee details if they exist
        const employee = await Employee.findOne({ user: user._id });
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: employee?._id
            }
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during verification',
            message: error.message
        });
    }
};

// Export both functions
export default { login, verify };