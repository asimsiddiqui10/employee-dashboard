import Document from '../models/Document.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, employeeId, documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Create directory for document type if it doesn't exist
    const targetDir = path.join(__dirname, '..', 'uploads', 'documents', documentType);
    await fs.mkdir(targetDir, { recursive: true });

    // Move file from temp to final location
    const tempPath = req.file.path;
    const targetPath = path.join(targetDir, req.file.filename);
    await fs.rename(tempPath, targetPath);

    // Create relative path for file URL (stored in DB)
    const fileUrl = path.join('documents', documentType, req.file.filename);

    const document = new Document({
      title,
      description,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl,
      documentType,
      uploadedBy: req.user._id,
      employeeId
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Document upload error:', error);
    
    // If there was an error, try to clean up the uploaded file
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    
    res.status(500).json({ message: 'Error uploading document' });
  }
};

export const getDocumentsByType = async (req, res) => {
  try {
    const { documentType } = req.params;
    
    // If admin, don't filter by employeeId
    // If employee, only show their documents
    const query = req.user.role === 'admin' 
      ? { documentType }
      : { documentType, employeeId: req.user._id };
    
    const documents = await Document.find(query)
      .sort('-uploadedAt')
      .populate('uploadedBy', 'name')
      .populate('employeeId', 'name');

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    if (req.user.role !== 'admin' && document.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Construct absolute file path
    const filePath = path.join(__dirname, '..', 'uploads', document.fileUrl);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', 'uploads', document.fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort('-uploadedAt')
      .populate('uploadedBy', 'name')
      .populate('employeeId', 'name');
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
}; 