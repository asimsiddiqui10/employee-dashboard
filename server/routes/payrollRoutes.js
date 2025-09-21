import express from 'express';
import { 
  uploadPayrollDocument, 
  getEmployeePayrollDocuments, 
  getAllPayrollDocuments,
  downloadPayrollDocument,
  getPayrollCategories,
  createPayrollPeriod,
  getPayrollCalendar,
  updatePayrollPeriod,
  deletePayrollPeriod
} from '../controllers/payrollController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import upload from '../middleware/payrollUploadMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/upload', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  upload.single('file'), 
  uploadPayrollDocument
);

router.get('/all', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  getAllPayrollDocuments
);

router.get('/categories', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  getPayrollCategories
);

// Payroll Calendar routes (Admin only)
router.post('/calendar', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  createPayrollPeriod
);

router.get('/calendar', 
  authMiddleware, 
  getPayrollCalendar
);

router.put('/calendar/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  updatePayrollPeriod
);

router.delete('/calendar/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  deletePayrollPeriod
);

// Employee routes
router.get('/my-documents', 
  authMiddleware, 
  getEmployeePayrollDocuments
);

router.get('/download/:id',
  authMiddleware,
  downloadPayrollDocument
);

export default router; 