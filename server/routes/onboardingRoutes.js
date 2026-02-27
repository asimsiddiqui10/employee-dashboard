import express from 'express';
import {
  createInvite,
  getInvites,
  verifyToken,
  completeOnboarding,
  uploadOnboardingDocument
} from '../controllers/onboardingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Admin-protected routes
router.post('/invite', authMiddleware, roleMiddleware(['admin']), createInvite);
router.get('/invites', authMiddleware, roleMiddleware(['admin']), getInvites);

// Public routes
router.get('/verify/:token', verifyToken);
router.post('/complete/:token', completeOnboarding);
router.post('/upload/:token', upload.single('file'), uploadOnboardingDocument);

export default router;
