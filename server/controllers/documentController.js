import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDocument = async (req, res) => {
  try {
    const { title, description, employeeId } = req.body;
    const file = req.file;

    const document = new Document({
      title,
      description,
      fileUrl: `/uploads/documents/${file.filename}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user._id,
      assignedTo: employeeId
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
};

export const getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ assignedTo: req.user.employee })
      .populate('uploadedBy', 'name')
      .sort('-uploadDate');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    console.log('Download request received for document ID:', req.params.id);
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      console.log('Document not found in database:', req.params.id);
      return res.status(404).json({ message: 'Document not found' });
    }
    
    console.log('Document found:', {
      title: document.title,
      fileUrl: document.fileUrl,
      fileType: document.fileType
    });

    // Get the filename from fileUrl and clean it
    const filename = document.fileUrl.replace(/^\/uploads\/documents\//, '');
    console.log('Extracted filename:', filename);

    // Construct the correct file path
    const filePath = path.join(__dirname, '..', 'uploads', 'documents', filename);
    console.log('Attempting to access file at:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist at path:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set response headers
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    // Create read stream
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });

    // Pipe the file to the response
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', {
      message: error.message,
      stack: error.stack
    });
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error downloading document' });
    }
  }
}; 