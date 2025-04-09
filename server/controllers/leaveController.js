import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import { calculateBusinessDays } from '../utils/dateUtils.js';
import mongoose from 'mongoose';

// Request leave
export const requestLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Find the employee making the request
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Calculate total days (excluding weekends)
    const totalDays = calculateBusinessDays(new Date(startDate), new Date(endDate));

    // Check if employee has enough leaves remaining
    if (employee.leaveSummary.leavesRemaining < totalDays) {
      return res.status(400).json({ 
        message: 'Insufficient leave balance',
        remaining: employee.leaveSummary.leavesRemaining
      });
    }

    const leaveRequest = new LeaveRequest({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    });

    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error requesting leave:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update leave request status (for admins)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find leave request and populate employee details
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Don't process if already approved/rejected
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        message: `Leave request already ${leaveRequest.status.toLowerCase()}` 
      });
    }

    // Find employee and ensure they exist
    const employee = await Employee.findById(leaveRequest.employee);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update leave request status
      leaveRequest.status = status;
      
      // Update employee's leave summary based on status
      if (status === 'Approved') {
        // Verify sufficient leave balance again
        if (employee.leaveSummary.leavesRemaining < leaveRequest.totalDays) {
          throw new Error('Insufficient leave balance');
        }
        
        // Update only the leave summary fields
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
        await Employee.findByIdAndUpdate(
          employee._id,
          {
            $inc: {
              'leaveSummary.leavesRejected': 1
            }
          },
          { session, new: true }
        );
      }

      // Save the leave request
      await leaveRequest.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      
      // Send response
      res.json({ 
        success: true,
        leaveRequest,
        message: `Leave request ${status.toLowerCase()} successfully`
      });

    } catch (error) {
      // If anything fails, abort transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }

  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error updating leave request' 
    });
  }
};

// Get my leave requests (for employees)
export const getMyLeaveRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leaveRequests = await LeaveRequest.find({ employee: employee._id })
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests (for admins)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate('employee', 'name employeeId')
      .sort({ createdAt: -1 });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    res.status(500).json({ message: error.message });
  }
}; 