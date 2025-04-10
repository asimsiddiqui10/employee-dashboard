import Document from '../models/Document.js';
import fs from 'fs/promises';
import path from 'path';

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
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), document.fileUrl);
    res.download(filePath, document.fileName);

    // Update status to downloaded
    document.status = 'downloaded';
    await document.save();
  } catch (error) {
    res.status(500).json({ message: 'Error downloading document' });
  }
}; 