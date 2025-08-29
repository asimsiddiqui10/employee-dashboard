import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';
import JobCode from '../models/JobCode.js';

// Get all schedules with pagination and filtering
export const getAllSchedules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employeeId,
      status,
      approvalStatus,
      startDate,
      endDate,
      department,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Build query filters
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (department) query['employee.department'] = department;
    
    if (startDate && endDate) {
      query.weekStartDate = { $lte: new Date(endDate) };
      query.weekEndDate = { $gte: new Date(startDate) };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { 'employee.name': { $regex: search, $options: 'i' } }
      ];
    }

    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId department position')
      .populate('createdBy', 'name employeeId')
      .populate('approvedBy', 'name employeeId')
      .sort({ weekStartDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Schedule.countDocuments(query);

    res.json({
      schedules,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch schedules' });
  }
};

// Get schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findById(id)
      .populate('employee', 'name employeeId department position employmentType')
      .populate('createdBy', 'name employeeId')
      .populate('approvedBy', 'name employeeId');

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch schedule' });
  }
};

// Get schedules for a specific employee
export const getEmployeeSchedules = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, status } = req.query;

    const query = { employeeId };

    if (status) query.status = status;
    if (startDate && endDate) {
      query.weekStartDate = { $lte: new Date(endDate) };
      query.weekEndDate = { $gte: new Date(startDate) };
    }

    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ weekStartDate: -1 });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching employee schedules:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employee schedules' });
  }
};

// Create new schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      employeeId,
      weekStartDate,
      schedules,
      status = 'draft',
      notes,
      isRecurring,
      recurringDays
    } = req.body;

    // Validate employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check for schedule conflicts
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const existingSchedule = await Schedule.findOne({
      employeeId,
      weekStartDate: { $lte: weekEndDate },
      weekEndDate: { $gte: new Date(weekStartDate) },
      status: { $in: ['draft', 'active'] }
    });

    if (existingSchedule) {
      return res.status(409).json({ 
        error: 'Schedule conflict: Another schedule exists for this week',
        conflictingSchedule: existingSchedule._id
      });
    }

    // Validate job codes and rates
    for (const daySchedule of schedules) {
      if (daySchedule.enabled) {
        const jobCode = await JobCode.findOne({ code: daySchedule.jobCode, isActive: true });
        if (!jobCode) {
          return res.status(400).json({ 
            error: `Invalid job code: ${daySchedule.jobCode}` 
          });
        }
        
        if (!jobCode.isValidRate(daySchedule.rate)) {
          return res.status(400).json({ 
            error: `Rate ${daySchedule.rate} is not valid for job code ${daySchedule.jobCode}` 
          });
        }
      }
    }

    const schedule = new Schedule({
      employee: employee._id,
      employeeId,
      weekStartDate: new Date(weekStartDate),
      weekEndDate,
      schedules: schedules.map(s => ({
        ...s,
        date: new Date(s.date)
      })),
      status,
      isRecurring: isRecurring || false,
      recurringDays: recurringDays || [],
      createdBy: req.user._id,
      notes
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to create schedule' });
  }
};

// Update schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check if schedule can be updated
    if (schedule.status === 'archived' || schedule.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Cannot update archived or cancelled schedule' 
      });
    }

    // If updating schedules array, validate job codes and rates
    if (updateData.schedules) {
      for (const daySchedule of updateData.schedules) {
        if (daySchedule.enabled) {
          const jobCode = await JobCode.findOne({ 
            code: daySchedule.jobCode, 
            isActive: true 
          });
          
          if (!jobCode) {
            return res.status(400).json({ 
              error: `Invalid job code: ${daySchedule.jobCode}` 
            });
          }
          
          if (!jobCode.isValidRate(daySchedule.rate)) {
            return res.status(400).json({ 
              error: `Rate ${daySchedule.rate} is not valid for job code ${daySchedule.jobCode}` 
            });
          }
        }
      }
    }

    // Update last modified by
    updateData.lastModifiedBy = req.user._id;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employee', 'name employeeId department')
     .populate('createdBy', 'name employeeId')
     .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: 'Schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to update schedule' });
  }
};

// Delete schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check if schedule can be deleted
    if (schedule.status === 'active') {
      return res.status(400).json({ 
        error: 'Cannot delete active schedule. Archive it instead.' 
      });
    }

    await Schedule.findByIdAndDelete(id);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to delete schedule' });
  }
};

// Approve/reject schedule
export const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, approvalNotes } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ 
        error: 'Invalid approval status. Must be "approved" or "rejected"' 
      });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    schedule.approvalStatus = approvalStatus;
    schedule.approvedBy = req.user._id;
    schedule.approvalDate = new Date();
    schedule.approvalNotes = approvalNotes;

    if (approvalStatus === 'approved') {
      schedule.status = 'active';
    }

    await schedule.save();

    const updatedSchedule = await Schedule.findById(id)
      .populate('employee', 'name employeeId department')
      .populate('approvedBy', 'name employeeId');

    res.json({
      message: `Schedule ${approvalStatus} successfully`,
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    res.status(500).json({ error: error.message || 'Failed to update approval status' });
  }
};

// Create schedule from company default
export const createScheduleFromCompanyDefault = async (req, res) => {
  try {
    const { employeeId, weekStartDate, companyDefaultId } = req.body;

    // Validate employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get company default
    const CompanyDefault = mongoose.model('CompanyDefault');
    const companyDefault = await CompanyDefault.findById(companyDefaultId);
    if (!companyDefault) {
      return res.status(404).json({ error: 'Company default not found' });
    }

    // Check for schedule conflicts
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const existingSchedule = await Schedule.findOne({
      employeeId,
      weekStartDate: { $lte: weekEndDate },
      weekEndDate: { $gte: new Date(weekStartDate) },
      status: { $in: ['draft', 'active'] }
    });

    if (existingSchedule) {
      return res.status(409).json({ 
        error: 'Schedule conflict: Another schedule exists for this week',
        conflictingSchedule: existingSchedule._id
      });
    }

    // Create schedules from company default
    const schedules = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dayName = days[i];
      const daySchedule = companyDefault.schedule[dayName];

      if (daySchedule.enabled) {
        schedules.push({
          date: currentDate,
          dayOfWeek: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          enabled: true,
          startTime: daySchedule.startTime,
          endTime: daySchedule.endTime,
          hours: daySchedule.hours,
          jobCode: companyDefault.defaultJobCode,
          rate: companyDefault.defaultRate,
          breaks: daySchedule.breaks || [],
          notes: ''
        });
      }
    }

    const schedule = new Schedule({
      employee: employee._id,
      employeeId,
      weekStartDate: new Date(weekStartDate),
      weekEndDate,
      schedules,
      status: 'draft',
      createdBy: req.user._id,
      notes: `Created from company default: ${companyDefault.name}`
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('employee', 'name employeeId department position')
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Schedule created from company default successfully',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error('Error creating schedule from company default:', error);
    res.status(500).json({ error: error.message || 'Failed to create schedule from company default' });
  }
};

// Copy schedule to next week
export const copyScheduleToNextWeek = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetWeekStartDate } = req.body;

    const sourceSchedule = await Schedule.findById(id);
    if (!sourceSchedule) {
      return res.status(404).json({ error: 'Source schedule not found' });
    }

    const targetWeekEndDate = new Date(targetWeekStartDate);
    targetWeekEndDate.setDate(targetWeekEndDate.getDate() + 6);

    // Check for conflicts
    const existingSchedule = await Schedule.findOne({
      employeeId: sourceSchedule.employeeId,
      weekStartDate: { $lte: targetWeekEndDate },
      weekEndDate: { $gte: new Date(targetWeekStartDate) },
      status: { $in: ['draft', 'active'] }
    });

    if (existingSchedule) {
      return res.status(409).json({ 
        error: 'Schedule conflict: Another schedule exists for the target week',
        conflictingSchedule: existingSchedule._id
      });
    }

    // Create new schedules with adjusted dates
    const newSchedules = sourceSchedule.schedules.map(schedule => ({
      ...schedule.toObject(),
      date: new Date(targetWeekStartDate.getTime() + 
        (schedule.date.getTime() - sourceSchedule.weekStartDate.getTime())),
      _id: undefined
    }));

    const newSchedule = new Schedule({
      employee: sourceSchedule.employee,
      employeeId: sourceSchedule.employeeId,
      weekStartDate: new Date(targetWeekStartDate),
      weekEndDate: targetWeekEndDate,
      schedules: newSchedules,
      status: 'draft',
      createdBy: req.user._id,
      notes: `Copied from schedule ${sourceSchedule._id}`
    });

    await newSchedule.save();

    const populatedSchedule = await Schedule.findById(newSchedule._id)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Schedule copied successfully',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error('Error copying schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to copy schedule' });
  }
};

// Get schedule statistics
export const getScheduleStats = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.weekStartDate = { $lte: new Date(endDate) };
      query.weekEndDate = { $gte: new Date(startDate) };
    }
    if (department) {
      query['employee.department'] = department;
    }

    const stats = await Schedule.aggregate([
      { $match: query },
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
        $group: {
          _id: null,
          totalSchedules: { $sum: 1 },
          totalHours: { $sum: '$totalWeeklyHours' },
          totalPay: { $sum: '$totalWeeklyPay' },
          avgHoursPerWeek: { $avg: '$totalWeeklyHours' },
          avgPayPerWeek: { $avg: '$totalWeeklyPay' }
        }
      }
    ]);

    const statusCounts = await Schedule.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const approvalCounts = await Schedule.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalSchedules: 0,
        totalHours: 0,
        totalPay: 0,
        avgHoursPerWeek: 0,
        avgPayPerWeek: 0
      },
      statusBreakdown: statusCounts,
      approvalBreakdown: approvalCounts
    });
  } catch (error) {
    console.error('Error fetching schedule stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch schedule stats' });
  }
};

// Bulk operations
export const bulkUpdateSchedules = async (req, res) => {
  try {
    const { scheduleIds, updates } = req.body;

    if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return res.status(400).json({ error: 'Schedule IDs array is required' });
    }

    const result = await Schedule.updateMany(
      { _id: { $in: scheduleIds } },
      { 
        ...updates,
        lastModifiedBy: req.user._id
      }
    );

    res.json({
      message: `${result.modifiedCount} schedules updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating schedules:', error);
    res.status(500).json({ error: error.message || 'Failed to bulk update schedules' });
  }
};

// Export schedules
export const exportSchedules = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.weekStartDate = { $lte: new Date(endDate) };
      query.weekEndDate = { $gte: new Date(startDate) };
    }

    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId')
      .sort({ weekStartDate: 1, employeeId: 1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = schedules.map(schedule => ({
        'Employee ID': schedule.employeeId,
        'Employee Name': schedule.employee?.name || '',
        'Department': schedule.employee?.department || '',
        'Week Start': schedule.weekStartDate.toISOString().split('T')[0],
        'Week End': schedule.weekEndDate.toISOString().split('T')[0],
        'Total Hours': schedule.totalWeeklyHours,
        'Total Pay': schedule.totalWeeklyPay,
        'Status': schedule.status,
        'Approval Status': schedule.approvalStatus
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=schedules.csv');
      
      // Simple CSV conversion
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.send(csvString);
    } else {
      res.json(schedules);
    }
  } catch (error) {
    console.error('Error exporting schedules:', error);
    res.status(500).json({ error: error.message || 'Failed to export schedules' });
  }
}; 