import Document from '../models/Document.js';
import { uploadFile, deleteFile } from '../config/supabase.js';

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

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${documentType}/${employeeId}/${timestamp}-${req.file.originalname}`;

    // Upload to Supabase
    const { publicUrl } = await uploadFile(
      'documents',
      filename,
      req.file.buffer,
      {
        contentType: req.file.mimetype
      }
    );

    const document = new Document({
      title,
      description,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl: publicUrl,
      documentType,
      uploadedBy: req.user._id,
      employeeId
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    res.status(500).json({ 
      message: 'Error uploading document',
      error: error.message 
    });
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
    const filePath = new URL(document.fileUrl).pathname.split('/').slice(-3).join('/');

    // Check if file exists
    try {
      await deleteFile('documents', filePath);
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

    // Extract filename from URL
    const fileUrl = new URL(document.fileUrl);
    const filePath = fileUrl.pathname.split('/').slice(-3).join('/');

    // Delete from Supabase
    await deleteFile('documents', filePath);

    // Delete from database
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({ 
      message: 'Error deleting document',
      error: error.message 
    });
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