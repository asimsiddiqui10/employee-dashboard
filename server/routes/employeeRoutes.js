// routes/employeeRoutes.js
import express from 'express';
import { addEmployee, editEmployee, deleteEmployee, getEmployees, getMyDetails, getEmployee, uploadProfilePic } from '../controllers/employeeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Employee routes
router.get('/me', authMiddleware, getMyDetails);

// Admin routes (protected by role middleware)
router.post('/', authMiddleware, addEmployee);
router.get('/', authMiddleware, getEmployees);
router.get('/:id', authMiddleware, getEmployee);
router.put('/:id', authMiddleware, editEmployee);
router.delete('/:id', authMiddleware, deleteEmployee);
router.post('/:id/profile-pic', authMiddleware, upload.single('profilePic'), uploadProfilePic);

export default router;
