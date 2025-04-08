import LeaveRequest from '../models/LeaveRequest.js';
import Employee from '../models/Employee.js';
import { calculateBusinessDays } from '../utils/dateUtils.js';

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

    const employee = await Employee.findById(leaveRequest.employee);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update leave request status and employee's leave summary
    leaveRequest.status = status;
    
    if (status === 'Approved') {
      employee.leaveSummary.leavesApproved += leaveRequest.totalDays;
      employee.leaveSummary.leavesTaken += leaveRequest.totalDays;
      employee.leaveSummary.leavesRemaining -= leaveRequest.totalDays;
    } else if (status === 'Rejected') {
      employee.leaveSummary.leavesRejected += 1;
    }

    await Promise.all([
      leaveRequest.save(),
      employee.save()
    ]);

    res.json({ leaveRequest, leaveSummary: employee.leaveSummary });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: error.message });
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