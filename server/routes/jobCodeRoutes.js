import express from 'express';
import {
  getAllJobCodes,
  getJobCodeById,
  getDefaultJobCode,
  getJobCodesByCategory,
  getActiveJobCodes,
  searchJobCodes,
  createJobCode,
  updateJobCode,
  deleteJobCode,
  toggleJobCodeStatus,
  setDefaultJobCode,
  bulkUpdateJobCodes,
  getJobCodeStats,
  importJobCodes
} from '../controllers/jobCodeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all job codes (admin only)
router.get('/', roleMiddleware(['admin']), getAllJobCodes);

// Get job code by ID (admin only)
router.get('/:id', roleMiddleware(['admin']), getJobCodeById);

// Get default job code (public for employees)
router.get('/default/get', getDefaultJobCode);

// Get job codes by category (public for employees)
router.get('/category/:category', getJobCodesByCategory);

// Get all active job codes (public for employees)
router.get('/active/all', getActiveJobCodes);

// Search job codes (public for employees)
router.get('/search/query', searchJobCodes);

// Create new job code (admin only)
router.post('/', roleMiddleware(['admin']), createJobCode);

// Update job code (admin only)
router.put('/:id', roleMiddleware(['admin']), updateJobCode);

// Delete job code (admin only)
router.delete('/:id', roleMiddleware(['admin']), deleteJobCode);

// Toggle job code status (admin only)
router.patch('/:id/toggle', roleMiddleware(['admin']), toggleJobCodeStatus);

// Set job code as default (admin only)
router.patch('/:id/default', roleMiddleware(['admin']), setDefaultJobCode);

// Bulk update job codes (admin only)
router.patch('/bulk', roleMiddleware(['admin']), bulkUpdateJobCodes);

// Get job code statistics (admin only)
router.get('/stats/overview', roleMiddleware(['admin']), getJobCodeStats);

// Import job codes (admin only)
router.post('/import', roleMiddleware(['admin']), importJobCodes);

export default router; 