import express from 'express';
import { 
  uploadPayrollDocument, 
  getEmployeePayrollDocuments, 
  getAllPayrollDocuments,
  downloadPayrollDocument
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