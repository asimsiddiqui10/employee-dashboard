import express from 'express';
import { uploadDocument, getEmployeeDocuments, downloadDocument } from '../controllers/documentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/documentUpload.js';

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('document'), uploadDocument);
router.get('/employee-documents', authMiddleware, getEmployeeDocuments);
router.get('/download/:id', authMiddleware, downloadDocument);

export default router; 