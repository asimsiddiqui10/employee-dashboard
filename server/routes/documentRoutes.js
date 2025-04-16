import express from 'express';
import { 
  uploadDocument, 
  getDocumentsByType,
  downloadDocument,
  deleteDocument,
  getAllDocuments 
} from '../controllers/documentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import upload from '../middleware/documentUpload.js';

const router = express.Router();

// Admin routes
router.post('/upload', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  upload.single('file'), 
  uploadDocument
);

// Get documents by type
router.get('/type/:documentType', 
  authMiddleware, 
  getDocumentsByType
);

// Get all documents (admin only)
router.get('/all', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  getAllDocuments
);

router.get('/download/:id', 
  authMiddleware, 
  downloadDocument
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  deleteDocument
);

export default router; 