import express from 'express';
import {
  punchIn,
  getTodayPunchEntry,
  getPunchEntries
} from '../controllers/punchController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected by auth middleware
router.use(authMiddleware);

// Punch operations
router.post('/punch-in', punchIn);

// Punch entries retrieval
router.get('/today', getTodayPunchEntry);
router.get('/', getPunchEntries);

export default router; 