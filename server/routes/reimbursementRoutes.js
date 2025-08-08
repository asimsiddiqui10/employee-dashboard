import express from 'express';
import {
  createReimbursement,
  getAllReimbursements,
  getEmployeeReimbursements,
  getReimbursementById,
  updateReimbursementStatus,
  updateReimbursement,
  deleteReceipt,
  deleteReimbursement,
  downloadReceipt,
  getReimbursementStats
} from '../controllers/reimbursementController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes (authenticated users)
router.use(authMiddleware);

// Admin only routes (must come before employee routes to avoid conflicts)
router.get('/admin/stats', roleMiddleware(['admin']), getReimbursementStats);
router.get('/', roleMiddleware(['admin']), getAllReimbursements);
router.put('/:reimbursementId/status', roleMiddleware(['admin']), updateReimbursementStatus);

// Employee routes
router.post('/', upload.array('receipts', 5), createReimbursement);
router.get('/my-reimbursements', getEmployeeReimbursements);
router.get('/:reimbursementId', getReimbursementById);
router.get('/:reimbursementId/receipts/:receiptId/download', downloadReceipt);
router.put('/:reimbursementId', upload.array('receipts', 5), updateReimbursement);
router.delete('/:reimbursementId', deleteReimbursement);
router.delete('/:reimbursementId/receipts/:receiptId', deleteReceipt);

export default router; 