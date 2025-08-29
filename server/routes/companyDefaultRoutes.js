import express from 'express';
import {
  getAllCompanyDefaults,
  getCompanyDefaultById,
  getDefaultCompanySchedule,
  createCompanyDefault,
  updateCompanyDefault,
  deleteCompanyDefault,
  setAsDefault,
  toggleCompanyDefaultStatus
} from '../controllers/companyDefaultController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all company defaults (admin only)
router.get('/', roleMiddleware(['admin']), getAllCompanyDefaults);

// Get company default by ID (admin only)
router.get('/:id', roleMiddleware(['admin']), getCompanyDefaultById);

// Get default company schedule (public for employees)
router.get('/default/get', getDefaultCompanySchedule);

// Create new company default (admin only)
router.post('/', roleMiddleware(['admin']), createCompanyDefault);

// Update company default (admin only)
router.put('/:id', roleMiddleware(['admin']), updateCompanyDefault);

// Delete company default (admin only)
router.delete('/:id', roleMiddleware(['admin']), deleteCompanyDefault);

// Set company default as default (admin only)
router.patch('/:id/default', roleMiddleware(['admin']), setAsDefault);

// Toggle company default status (admin only)
router.patch('/:id/toggle', roleMiddleware(['admin']), toggleCompanyDefaultStatus);

export default router; 