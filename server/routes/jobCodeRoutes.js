import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getAllJobCodes,
  getJobCodeById,
  getDefaultJobCode,
  getActiveJobCodes,
  createJobCode,
  updateJobCode,
  deleteJobCode,
  setAsDefault,
  toggleJobCodeStatus,
  getJobCodeStats,
  bulkCreateJobCodes,
  exportJobCodes,
  debugJobCodes,
  assignJobCodeToEmployees,
  removeJobCodeFromEmployees,
  getJobCodesByEmployee
} from '../controllers/jobCodeController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Public routes (for authenticated users)
router.get('/active/all', getActiveJobCodes);
router.get('/default', getDefaultJobCode);
router.get('/employee/:employeeId', getJobCodesByEmployee);

// Admin-only routes
router.get('/', roleMiddleware(['admin']), getAllJobCodes);
router.post('/', roleMiddleware(['admin']), createJobCode);
router.post('/bulk', roleMiddleware(['admin']), bulkCreateJobCodes);
router.get('/export', roleMiddleware(['admin']), exportJobCodes);
router.get('/stats', roleMiddleware(['admin']), getJobCodeStats);
router.get('/debug', roleMiddleware(['admin']), debugJobCodes);
router.get('/:id', roleMiddleware(['admin']), getJobCodeById);
router.put('/:id', roleMiddleware(['admin']), updateJobCode);
router.delete('/:id', roleMiddleware(['admin']), deleteJobCode);
router.patch('/:id/set-default', roleMiddleware(['admin']), setAsDefault);
router.patch('/:id/toggle-status', roleMiddleware(['admin']), toggleJobCodeStatus);
router.post('/:id/assign', roleMiddleware(['admin']), assignJobCodeToEmployees);
router.post('/:id/remove', roleMiddleware(['admin']), removeJobCodeFromEmployees);

export default router; 