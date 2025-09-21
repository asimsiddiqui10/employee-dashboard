import Payroll from '../models/Payroll.js';
import PayrollCalendar from '../models/PayrollCalendar.js';
import Employee from '../models/Employee.js';
import { uploadFile } from '../config/supabase.js';

export const uploadPayrollDocument = async (req, res) => {
  try {
    console.log('Upload request received:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, employeeId, payPeriodStart, payPeriodEnd, category } = req.body;

    console.log('Extracted fields:', { title, description, employeeId, payPeriodStart, payPeriodEnd, category });

    // Validate required fields
    if (!title || !employeeId || !payPeriodStart || !payPeriodEnd) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'employeeId', 'payPeriodStart', 'payPeriodEnd'],
        received: { title: !!title, employeeId: !!employeeId, payPeriodStart: !!payPeriodStart, payPeriodEnd: !!payPeriodEnd }
      });
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `payroll/${employeeId}/${timestamp}-${req.file.originalname}`;

    console.log('Uploading file to Supabase:', filename);

    // Upload to Supabase
    const { publicUrl } = await uploadFile(
      'documents',
      filename,
      req.file.buffer,
      {
        contentType: req.file.mimetype
      }
    );

    console.log('File uploaded successfully, creating document:', { publicUrl });

    const document = new Payroll({
      title,
      description,
      category: category || 'General',
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl: publicUrl,
      uploadedBy: req.user._id,
      employeeId,
      payPeriodStart,
      payPeriodEnd
    });

    console.log('Saving document to database...');
    await document.save();
    console.log('Document saved successfully');
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Detailed error in uploadPayrollDocument:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Error uploading payroll document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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

// Get distinct categories for filtering
export const getPayrollCategories = async (req, res) => {
  try {
    const categories = await Payroll.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    console.error('Error in getPayrollCategories:', error);
    res.status(500).json({ message: 'Error fetching payroll categories' });
  }
};

// Payroll Calendar Functions
export const createPayrollPeriod = async (req, res) => {
  try {
    const { title, payPeriodStart, payPeriodEnd, payDate, notes } = req.body;

    const period = new PayrollCalendar({
      title,
      payPeriodStart,
      payPeriodEnd,
      payDate,
      notes,
      createdBy: req.user._id
    });

    await period.save();
    res.status(201).json(period);
  } catch (error) {
    console.error('Error in createPayrollPeriod:', error);
    res.status(500).json({ message: 'Error creating payroll period' });
  }
};

export const getPayrollCalendar = async (req, res) => {
  try {
    const periods = await PayrollCalendar.find()
      .populate('createdBy', 'name')
      .sort({ payPeriodStart: -1 });
    res.json(periods);
  } catch (error) {
    console.error('Error in getPayrollCalendar:', error);
    res.status(500).json({ message: 'Error fetching payroll calendar' });
  }
};

export const updatePayrollPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const period = await PayrollCalendar.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: Date.now() }, 
      { new: true }
    ).populate('createdBy', 'name');

    if (!period) {
      return res.status(404).json({ message: 'Payroll period not found' });
    }

    res.json(period);
  } catch (error) {
    console.error('Error in updatePayrollPeriod:', error);
    res.status(500).json({ message: 'Error updating payroll period' });
  }
};

export const deletePayrollPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    
    const period = await PayrollCalendar.findByIdAndDelete(id);
    if (!period) {
      return res.status(404).json({ message: 'Payroll period not found' });
    }

    res.json({ message: 'Payroll period deleted successfully' });
  } catch (error) {
    console.error('Error in deletePayrollPeriod:', error);
    res.status(500).json({ message: 'Error deleting payroll period' });
  }
}; 