import Reimbursement from '../models/Reimbursement.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { uploadFile, deleteFile } from '../config/supabase.js';
import { format } from 'date-fns';

// Create a new reimbursement request
export const createReimbursement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, category, amount, currency, description, expenseDate, priority, tags } = req.body;
    const employeeId = req.user.employee._id || req.user.employee;

    // Validate required fields
    if (!title || !category || !amount || !description || !expenseDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, amount, description, expenseDate'
      });
    }

    // Validate employee exists
    const employee = await Employee.findById(employeeId).session(session);
    if (!employee) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Handle file uploads
    const receipts = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const fileName = `reimbursements/${employeeId.toString()}/${Date.now()}-${file.originalname}`;
          const { publicUrl } = await uploadFile('documents', fileName, file.buffer, {
            contentType: file.mimetype
          });

          receipts.push({
            fileName,
            originalName: file.originalname,
            fileUrl: publicUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          // Continue with other files, don't fail the entire request
        }
      }
    }

    // Create reimbursement request
    const reimbursement = new Reimbursement({
      employee: employeeId,
      title,
      category,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      description,
      expenseDate: new Date(expenseDate),
      receipts,
      priority: priority || 'Medium',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      status: 'Pending'
    });

    // Add initial status history
    reimbursement.addStatusHistory('Pending', 'Reimbursement request submitted', employeeId);

    await reimbursement.save({ session });

    // Create notification for admins
    const adminEmployees = await Employee.find({ role: 'admin' }).select('_id').session(session);
    if (adminEmployees.length > 0) {
      const notification = new Notification({
        type: 'other',
        title: 'New Reimbursement Request',
        message: `${employee.name} has submitted a new reimbursement request for ${reimbursement.formattedAmount}`,
        sender: employee.user,
        recipients: adminEmployees.map(admin => ({
          employeeId: admin._id,
          read: false,
          readAt: null,
          readBy: null
        })),
        priority: 'medium',
        link: `/admin-dashboard/reimbursements/${reimbursement._id}`
      });

      await notification.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Populate employee data for response
    await reimbursement.populate('employee', 'name employeeId email');

    res.status(201).json({
      success: true,
      message: 'Reimbursement request created successfully',
      data: reimbursement
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating reimbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reimbursement request',
      error: error.message
    });
  }
};

// Get all reimbursements (Admin)
export const getAllReimbursements = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $lookup: {
          from: 'employees',
          localField: 'reviewedBy',
          foreignField: '_id',
          as: 'reviewedBy'
        }
      },
      {
        $unwind: {
          path: '$reviewedBy',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'employee.name': { $regex: search, $options: 'i' } },
            { 'employee.employeeId': { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Execute aggregation
    const reimbursements = await Reimbursement.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' }
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { 'employee.name': { $regex: search, $options: 'i' } },
            { 'employee.employeeId': { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    countPipeline.push({ $count: 'total' });
    const countResult = await Reimbursement.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Get summary statistics
    const stats = await Reimbursement.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: reimbursements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching reimbursements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reimbursements',
      error: error.message
    });
  }
};

// Get employee's reimbursements
export const getEmployeeReimbursements = async (req, res) => {
  try {
    const employeeId = req.user.employee._id || req.user.employee;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { employee: employeeId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reimbursements = await Reimbursement.find(filter)
      .populate('employee', 'name employeeId email')
      .populate('reviewedBy', 'name employeeId')
      .populate('statusHistory.updatedBy', 'name employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reimbursement.countDocuments(filter);

    // Get employee's reimbursement summary
    const summary = await Reimbursement.aggregate([
      { $match: { employee: new mongoose.Types.ObjectId(employeeId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: reimbursements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching employee reimbursements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reimbursements',
      error: error.message
    });
  }
};

// Get reimbursement by ID
export const getReimbursementById = async (req, res) => {
  try {
    const { reimbursementId } = req.params;
    const userRole = req.user.role;

    const reimbursement = await Reimbursement.findById(reimbursementId)
      .populate('employee', 'name employeeId email department')
      .populate('reviewedBy', 'name employeeId')
      .populate('statusHistory.updatedBy', 'name employeeId');

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found'
      });
    }

    // Check permissions - employees can only view their own reimbursements
    if (userRole !== 'admin') {
      const employeeId = req.user.employee?._id || req.user.employee;
      if (!employeeId || reimbursement.employee._id.toString() !== employeeId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: reimbursement
    });

  } catch (error) {
    console.error('Error fetching reimbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reimbursement',
      error: error.message
    });
  }
};

// Update reimbursement status (Admin only)
export const updateReimbursementStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reimbursementId } = req.params;
    const { status, reviewNotes, paidAmount } = req.body;
    
    // For admin users, find or create an employee record if needed
    let reviewerId = req.user.employee?._id || req.user.employee;
    if (!reviewerId && req.user.role === 'admin') {
      // For admin users without employee records, use a system reviewer approach
      const systemAdmin = await Employee.findOne({ role: 'admin' }).session(session);
      reviewerId = systemAdmin?._id;
    }

    // Validate status
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Paid'];
    if (!validStatuses.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const reimbursement = await Reimbursement.findById(reimbursementId)
      .populate('employee', 'name employeeId email')
      .session(session);

    if (!reimbursement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found'
      });
    }

    // Update reimbursement
    reimbursement.status = status;
    reimbursement.reviewedBy = reviewerId;
    reimbursement.reviewedAt = new Date();
    if (reviewNotes) reimbursement.reviewNotes = reviewNotes;
    if (status === 'Paid' && paidAmount) reimbursement.paidAmount = parseFloat(paidAmount);

    await reimbursement.save({ session });

    // Create notification for employee
    const reviewer = await Employee.findById(reviewerId).populate('user').session(session);
    if (reviewer && reviewer.user) {
      const notification = new Notification({
        type: 'other',
        title: 'Reimbursement Status Updated',
        message: `Your reimbursement request "${reimbursement.title}" has been ${status.toLowerCase()}`,
        sender: reviewer.user._id,
        recipients: [{
          employeeId: reimbursement.employee._id,
          read: false,
          readAt: null,
          readBy: null
        }],
        priority: status === 'Rejected' ? 'high' : 'medium',
        link: `/employee-dashboard/reimbursements/${reimbursement._id}`
      });

      await notification.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: `Reimbursement ${status.toLowerCase()} successfully`,
      data: reimbursement
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating reimbursement status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reimbursement status',
      error: error.message
    });
  }
};

// Update reimbursement (Employee only - if status allows)
export const updateReimbursement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reimbursementId } = req.params;
    const { title, category, amount, currency, description, expenseDate, priority, tags } = req.body;
    const employeeId = req.user.employee._id || req.user.employee;

    const reimbursement = await Reimbursement.findById(reimbursementId).session(session);

    if (!reimbursement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found'
      });
    }

    // Check permissions
    if (reimbursement.employee.toString() !== employeeId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if reimbursement can be edited
    if (!reimbursement.canBeEdited()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Reimbursement cannot be edited in current status'
      });
    }

    // Handle file uploads (add new receipts)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const fileName = `reimbursements/${employeeId.toString()}/${Date.now()}-${file.originalname}`;
          const { publicUrl } = await uploadFile('documents', fileName, file.buffer, {
            contentType: file.mimetype
          });

          reimbursement.receipts.push({
            fileName,
            originalName: file.originalname,
            fileUrl: publicUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
        }
      }
    }

    // Update fields
    if (title) reimbursement.title = title;
    if (category) reimbursement.category = category;
    if (amount) reimbursement.amount = parseFloat(amount);
    if (currency) reimbursement.currency = currency;
    if (description) reimbursement.description = description;
    if (expenseDate) reimbursement.expenseDate = new Date(expenseDate);
    if (priority) reimbursement.priority = priority;
    if (tags) reimbursement.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

    reimbursement.addStatusHistory('Under Review', 'Reimbursement updated by employee', employeeId);

    await reimbursement.save({ session });

    await session.commitTransaction();
    session.endSession();

    await reimbursement.populate('employee', 'name employeeId email');

    res.json({
      success: true,
      message: 'Reimbursement updated successfully',
      data: reimbursement
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating reimbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reimbursement',
      error: error.message
    });
  }
};

// Delete reimbursement receipt
export const deleteReceipt = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reimbursementId, receiptId } = req.params;
    const employeeId = req.user.employee._id || req.user.employee;
    const userRole = req.user.role;

    const reimbursement = await Reimbursement.findById(reimbursementId).session(session);

    if (!reimbursement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found'
      });
    }

    // Check permissions
    if (userRole !== 'admin' && reimbursement.employee.toString() !== employeeId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find receipt
    const receiptIndex = reimbursement.receipts.findIndex(
      receipt => receipt._id.toString() === receiptId
    );

    if (receiptIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const receipt = reimbursement.receipts[receiptIndex];

    // Delete file from Supabase
    try {
      await deleteFile('documents', receipt.fileName);
    } catch (deleteError) {
      console.error('Error deleting file from Supabase:', deleteError);
      // Continue with database deletion even if file deletion fails
    }

    // Remove receipt from array
    reimbursement.receipts.splice(receiptIndex, 1);
    await reimbursement.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete receipt',
      error: error.message
    });
  }
};

// Delete reimbursement (Employee only - if status allows)
export const deleteReimbursement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reimbursementId } = req.params;
    const employeeId = req.user.employee._id || req.user.employee;

    const reimbursement = await Reimbursement.findById(reimbursementId).session(session);

    if (!reimbursement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found'
      });
    }

    // Check permissions
    if (reimbursement.employee.toString() !== employeeId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if reimbursement can be cancelled
    if (!reimbursement.canBeCancelled()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Reimbursement cannot be cancelled in current status'
      });
    }

    // Delete all receipt files from Supabase
    for (const receipt of reimbursement.receipts) {
      try {
        await deleteFile('documents', receipt.fileName);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }

    // Delete reimbursement
    await Reimbursement.findByIdAndDelete(reimbursementId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Reimbursement cancelled successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting reimbursement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reimbursement',
      error: error.message
    });
  }
};

// Download receipt
export const downloadReceipt = async (req, res) => {
  try {
    const { reimbursementId, receiptId } = req.params;
    const userRole = req.user.role;

    const reimbursement = await Reimbursement.findById(reimbursementId);

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement not found'
      });
    }

    // Check permissions
    if (userRole !== 'admin') {
      const employeeId = req.user.employee?._id || req.user.employee;
      if (!employeeId || reimbursement.employee.toString() !== employeeId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Find the specific receipt
    const receipt = reimbursement.receipts.find(r => r._id.toString() === receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      downloadUrl: receipt.fileUrl,
      fileName: receipt.originalName
    });

  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download receipt',
      error: error.message
    });
  }
};

// Get reimbursement dashboard stats (Admin)
export const getReimbursementStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        dateFilter = {
          createdAt: {
            $gte: quarterStart
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
        };
        break;
    }

    // Get overall statistics
    const [statusStats, categoryStats, monthlyTrend, recentReimbursements] = await Promise.all([
      // Status distribution
      Reimbursement.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]),

      // Category distribution
      Reimbursement.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]),

      // Monthly trend (last 12 months)
      Reimbursement.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Recent reimbursements
      Reimbursement.find()
        .populate('employee', 'name employeeId')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title amount status createdAt employee')
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        categoryStats,
        monthlyTrend,
        recentReimbursements,
        period
      }
    });

  } catch (error) {
    console.error('Error fetching reimbursement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reimbursement statistics',
      error: error.message
    });
  }
}; 