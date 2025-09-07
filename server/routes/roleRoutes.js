import express from 'express';
import {
  switchRole,
  getCurrentUserRoles,
  addRoleToUser,
  removeRoleFromUser,
  getAllUsersWithRoles
} from '../controllers/roleController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get current user's role information
router.get('/me', getCurrentUserRoles);

// Switch active role
router.post('/switch', switchRole);

// Admin-only routes for managing user roles
router.get('/users', roleMiddleware(['admin']), getAllUsersWithRoles);
router.post('/add', roleMiddleware(['admin']), addRoleToUser);
router.post('/remove', roleMiddleware(['admin']), removeRoleFromUser);

export default router; 