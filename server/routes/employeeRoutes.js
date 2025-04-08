// routes/employeeRoutes.js
import express from 'express';
import { addEmployee, editEmployee, deleteEmployee, getEmployees, getMyDetails, getEmployee, uploadProfilePic } from '../controllers/employeeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Only admins can manage employees
router.post('/', authMiddleware, addEmployee);
router.put('/:employeeId', authMiddleware, editEmployee);
router.delete('/:employeeId', authMiddleware, deleteEmployee);

// Add this line to handle GET requests
router.get('/', authMiddleware, getEmployees);

// Add this to your existing routes
router.get('/me', authMiddleware, getMyDetails);

router.get('/:employeeId', getEmployee);

// Add this new route for profile picture upload
router.post('/:employeeId/profile-pic', authMiddleware, upload.single('profilePic'), uploadProfilePic);

export default router;
