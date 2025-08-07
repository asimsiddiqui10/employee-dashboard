import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import mongoose from 'mongoose';
import { startOfYear, endOfYear, differenceInBusinessDays } from 'date-fns';

// Request leave
export const requestLeave = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { leaveType, startDate, endDate, description } = req.body;
    const employeeId = req.user.employee;

    // Find employee and their current leave balance
    const employee = await Employee.findById(employeeId).session(session);
    if (!employee) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Calculate total days (excluding weekends)
    const totalDays = differenceInBusinessDays(new Date(endDate), new Date(startDate)) + 1;
    
    // Validate leave balance
    if (employee.leaveSummary.leavesRemaining < totalDays) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient leave balance. Available: ${employee.leaveSummary.leavesRemaining} days` 
      });
    }

    // Create leave request without updating leave summary
    const leaveRequest = new LeaveRequest({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      description,
      status: 'Pending' // Explicitly set status
    });

    await leaveRequest.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Populate employee details before sending response
    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('employee', 'name employeeId department')
      .populate('reviewedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: populatedRequest
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error requesting leave:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error submitting leave request' 
    });
  }
};

// Get all leave requests (admin)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, startDate, endDate, department } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    // Get requests with populated employee details
    const requests = await LeaveRequest.find(query)
      .populate('employee', 'name employeeId department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    // Filter by department if specified
    const filteredRequests = department
      ? requests.filter(req => req.employee.department === department)
      : requests;

    res.json({
      success: true,
      data: filteredRequests
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching leave requests' 
    });
  }
};

// Get my leave requests (employee)
export const getMyLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { year } = req.query;

    // Build date range for filtering
    const startDate = year ? startOfYear(new Date(year, 0)) : startOfYear(new Date());
    const endDate = year ? endOfYear(new Date(year, 0)) : endOfYear(new Date());

    const requests = await LeaveRequest.find({
      employee: employeeId,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate }
    }).populate('reviewedBy', 'name').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching leave requests' 
    });
  }
};

// Get leave requests for a specific employee (admin)
export const getEmployeeLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    // Find employee first
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Build date range for filtering
    const startDate = year ? startOfYear(new Date(year, 0)) : startOfYear(new Date());
    const endDate = year ? endOfYear(new Date(year, 0)) : endOfYear(new Date());

    const requests = await LeaveRequest.find({
      employee: employee._id,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate }
    })
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching employee leave requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching employee leave requests' 
    });
  }
};

// Update leave request status (admin)
export const updateLeaveStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { status, reviewNotes } = req.body;
    const adminId = req.user._id;

    // Find leave request
    const leaveRequest = await LeaveRequest.findById(requestId)
      .populate('employee')
      .session(session);

    if (!leaveRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // If request was already approved/rejected, don't allow changes
    if (leaveRequest.status !== 'Pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}` 
      });
    }

    // Update request status
    leaveRequest.status = status;
    leaveRequest.reviewedBy = adminId;
    leaveRequest.reviewNotes = reviewNotes;
    leaveRequest.reviewedAt = new Date();

    // Update employee leave summary based on status
    const employee = leaveRequest.employee;
    
    if (status === 'Approved') {
      // Verify sufficient leave balance again
      if (employee.leaveSummary.leavesRemaining < leaveRequest.totalDays) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient leave balance' 
        });
      }

      // Update leave summary only on approval
      await Employee.findByIdAndUpdate(
        employee._id,
        {
          $inc: {
            'leaveSummary.leavesApproved': leaveRequest.totalDays,
            'leaveSummary.leavesTaken': leaveRequest.totalDays,
            'leaveSummary.leavesRemaining': -leaveRequest.totalDays
          }
        },
        { session, new: true }
      );
    } else if (status === 'Rejected') {
      // Update rejected count
      await Employee.findByIdAndUpdate(
        employee._id,
        {
          $inc: {
            'leaveSummary.leavesRejected': leaveRequest.totalDays
          }
        },
        { session, new: true }
      );
    }

    await leaveRequest.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Populate and return updated request
    const populatedRequest = await LeaveRequest.findById(requestId)
      .populate('employee', 'name employeeId department')
      .populate('reviewedBy', 'name');

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: populatedRequest
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating leave status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating leave request' 
    });
  }
};

// Cancel leave request (employee)
export const cancelLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const employeeId = req.user.employee;

    // Find leave request
    const leaveRequest = await LeaveRequest.findOne({
      _id: requestId,
      employee: employeeId
    }).session(session);

    if (!leaveRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Check if request can be cancelled
    if (!leaveRequest.canBeCancelled()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: 'Leave request cannot be cancelled' 
      });
    }

    // If request was approved, restore leave balance
    if (leaveRequest.status === 'Approved') {
      await Employee.findByIdAndUpdate(
        employeeId,
        {
          $inc: {
            'leaveSummary.leavesApproved': -leaveRequest.totalDays,
            'leaveSummary.leavesTaken': -leaveRequest.totalDays,
            'leaveSummary.leavesRemaining': leaveRequest.totalDays
          }
        },
        { session }
      );
    }

    // Delete the request
    await LeaveRequest.findByIdAndDelete(requestId).session(session);
    
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error cancelling leave request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error cancelling leave request' 
    });
  }
}; 