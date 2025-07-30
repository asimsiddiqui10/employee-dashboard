// routes/employeeRoutes.js
import express from 'express';
import { addEmployee, editEmployee, deleteEmployee, getEmployees, getMyDetails, getEmployee, uploadProfilePic, changeEmployeePassword, getEmployeeCountsByDepartment, getEmployeesByDepartment } from '../controllers/employeeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Employee routes
router.get('/me', authMiddleware, getMyDetails);
router.get('/department/:department', authMiddleware, getEmployeesByDepartment);

// Admin routes (protected by role middleware)
router.post('/', authMiddleware, addEmployee);
router.get('/', authMiddleware, getEmployees);
router.get('/department-counts', authMiddleware, getEmployeeCountsByDepartment);
router.get('/:employeeId', authMiddleware, getEmployee);
router.put('/:employeeId', authMiddleware, editEmployee);
router.delete('/:employeeId', authMiddleware, deleteEmployee);
router.post('/:employeeId/profile-pic', authMiddleware, upload.single('profilePic'), uploadProfilePic);
router.put('/:employeeId/change-password', authMiddleware, changeEmployeePassword);

export default router;
