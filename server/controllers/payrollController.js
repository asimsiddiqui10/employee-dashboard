import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { uploadFile } from '../config/supabase.js';

export const uploadPayrollDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, employeeId, payPeriodStart, payPeriodEnd } = req.body;

    // Create unique filename
    const timestamp = Date.now();
    const filename = `payroll/${employeeId}/${timestamp}-${req.file.originalname}`;

    // Upload to Supabase
    const { publicUrl } = await uploadFile(
      'documents',
      filename,
      req.file.buffer,
      {
        contentType: req.file.mimetype
      }
    );

    const document = new Payroll({
      title,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl: publicUrl,
      uploadedBy: req.user._id,
      employeeId,
      payPeriodStart,
      payPeriodEnd
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error in uploadPayrollDocument:', error);
    res.status(500).json({ message: 'Error uploading payroll document' });
  }
};

export const getEmployeePayrollDocuments = async (req, res) => {
  try {
    // Find the employee record for the logged-in user
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get documents for this employee
    const documents = await Payroll.find({ employeeId: employee._id })
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'name');
    
    res.json(documents);
  } catch (error) {
    console.error('Error in getEmployeePayrollDocuments:', error);
    res.status(500).json({ message: 'Error fetching payroll documents' });
  }
};

export const getAllPayrollDocuments = async (req, res) => {
  try {
    const documents = await Payroll.find()
      .populate('employeeId', 'name employeeId')
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error in getAllPayrollDocuments:', error);
    res.status(500).json({ message: 'Error fetching all payroll documents' });
  }
};

export const downloadPayrollDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Payroll.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // For admin users, allow access to all documents
    if (req.user.role === 'admin') {
      return res.json({ downloadUrl: document.fileUrl });
    }

    // For employees, find their employee record first
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if the document belongs to this employee
    if (document.employeeId.toString() !== employee._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Return the download URL
    res.json({ downloadUrl: document.fileUrl });
  } catch (error) {
    console.error('Error in downloadPayrollDocument:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
}; 