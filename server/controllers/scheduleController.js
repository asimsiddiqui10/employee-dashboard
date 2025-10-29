import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';
import mongoose from 'mongoose';

// Create a single schedule
export const createSchedule = async (req, res) => {
  try {
    const { 
      employeeId, 
      jobCode, 
      date, 
      startTime, 
      endTime, 
      notes,
      skipConflictCheck = false
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !jobCode || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check for conflicts before creating (unless skipping)
    if (!skipConflictCheck) {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const newStartMinutes = timeToMinutes(startTime);
      const newEndMinutes = timeToMinutes(endTime);
      
      const existingSchedules = await Schedule.find({
        employeeId,
        date: date
      }).populate('employee', 'name employeeId');
      
      const conflicts = existingSchedules.filter(schedule => {
        const existingStartMinutes = timeToMinutes(schedule.startTime);
        const existingEndMinutes = timeToMinutes(schedule.endTime);
        return !(newEndMinutes <= existingStartMinutes || newStartMinutes >= existingEndMinutes);
      });
      
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: 'Schedule conflict detected',
          conflicts: conflicts.map(c => ({
            _id: c._id,
            startTime: c.startTime,
            endTime: c.endTime,
            employeeName: c.employee?.name || c.employeeName || 'Unknown Employee',
            jobCode: c.jobCode,
            date: c.date
          }))
        });
      }
    }
    
    // Find employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const scheduleData = {
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      date: date,
      jobCode,
      startTime,
      endTime,
      createdBy: req.user._id,
      notes: notes || ''
    };
    
    const schedule = new Schedule(scheduleData);
    await schedule.save();
    
    res.status(201).json({
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error creating schedule' });
  }
};

// Create multiple schedules (batch)
export const createBatchSchedules = async (req, res) => {
  try {
    const { schedules, skipConflictCheck = false } = req.body;
    
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: 'Schedules array is required' });
    }
    
    // Validate all schedules
    const validationErrors = [];
    schedules.forEach((schedule, index) => {
      if (!schedule.employeeId || !schedule.date || !schedule.jobCode || !schedule.startTime || !schedule.endTime) {
        validationErrors.push(`Schedule ${index + 1}: Missing required fields`);
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Check for conflicts before creating batch schedules (unless skipping)
    if (!skipConflictCheck) {
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const allConflicts = [];
      
      for (const schedule of schedules) {
        const newStartMinutes = timeToMinutes(schedule.startTime);
        const newEndMinutes = timeToMinutes(schedule.endTime);
        
        const existingSchedules = await Schedule.find({
          employeeId: schedule.employeeId,
          date: schedule.date
        }).populate('employee', 'name employeeId');
        
        const conflicts = existingSchedules.filter(existingSchedule => {
          const existingStartMinutes = timeToMinutes(existingSchedule.startTime);
          const existingEndMinutes = timeToMinutes(existingSchedule.endTime);
          return !(newEndMinutes <= existingStartMinutes || newStartMinutes >= existingEndMinutes);
        });
        
        // Add conflicts to the collection
        allConflicts.push(...conflicts.map(c => ({
          _id: c._id,
          startTime: c.startTime,
          endTime: c.endTime,
          employeeName: c.employee?.name || c.employeeName || 'Unknown Employee',
          jobCode: c.jobCode,
          date: c.date
        })));
      }
      
      if (allConflicts.length > 0) {
        return res.status(409).json({ 
          message: `Schedule conflicts detected for ${allConflicts.length} date(s)`,
          conflicts: allConflicts
        });
      }
    }
    
    // Get unique employee IDs to fetch employee records
    const uniqueEmployeeIds = [...new Set(schedules.map(s => s.employeeId))];
    const employees = await Employee.find({ employeeId: { $in: uniqueEmployeeIds } });
    const employeeMap = new Map(employees.map(emp => [emp.employeeId, emp._id]));
    
    // Prepare schedules with required fields
    const schedulesWithRequiredFields = schedules.map(schedule => ({
      ...schedule,
      employee: employeeMap.get(schedule.employeeId),
      createdBy: req.user.id,
      date: schedule.date
    }));
    
    // Bulk insert
    const createdSchedules = await Schedule.insertMany(schedulesWithRequiredFields);
    
    res.status(201).json({
      message: `Created ${createdSchedules.length} schedules successfully`,
      schedules: createdSchedules
    });
  } catch (error) {
    console.error('Create batch schedules error:', error);
    res.status(500).json({ message: 'Error creating batch schedules' });
  }
};

// Check for time conflicts
export const checkTimeConflicts = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime, excludeId } = req.body;
    
    if (!employeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Convert time strings to minutes for proper comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const newStartMinutes = timeToMinutes(startTime);
    const newEndMinutes = timeToMinutes(endTime);
    
    // Get all schedules for this employee on this date
           const query = {
             employeeId,
             date: date
           };
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existingSchedules = await Schedule.find(query);
    
    // Check for conflicts by comparing time ranges
    const conflicts = existingSchedules.filter(schedule => {
      const existingStartMinutes = timeToMinutes(schedule.startTime);
      const existingEndMinutes = timeToMinutes(schedule.endTime);
      
      // Check if time ranges overlap
      return !(newEndMinutes <= existingStartMinutes || newStartMinutes >= existingEndMinutes);
    });
    
    res.json(conflicts);
  } catch (error) {
    console.error('Check conflicts error:', error);
    res.status(500).json({ message: 'Error checking conflicts' });
  }
};

// Get all schedules with pagination
export const getAllSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Schedule.countDocuments(query);
    
    res.json({
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Server error fetching schedules' });
  }
};

// Get schedules by employee ID with pagination
export const getSchedulesByEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    
    const query = { employeeId: id };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const schedules = await Schedule.find(query)
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Schedule.countDocuments(query);
    
    res.json({
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employee schedules error:', error);
    res.status(500).json({ message: 'Server error fetching employee schedules' });
  }
};

// Get schedules by date range with pagination
export const getSchedulesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 100 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Schedule.countDocuments(query);
    
    res.json({
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get schedules by date range error:', error);
    res.status(500).json({ message: 'Server error fetching schedules' });
  }
};

// Get single schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findById(id)
      .populate('employee', 'name employeeId department');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Get schedule by ID error:', error);
    res.status(500).json({ message: 'Server error fetching schedule' });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingSchedule = await Schedule.findById(id);
    
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    Object.assign(existingSchedule, updates);
    await existingSchedule.save();
    
    res.json({
      message: 'Schedule updated successfully',
      schedule: existingSchedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error updating schedule' });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await Schedule.findByIdAndDelete(id);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Server error deleting schedule' });
  }
};

// Bulk delete schedules by date range
export const bulkDeleteSchedules = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Employee ID, start date, and end date are required' });
    }
    
    const result = await Schedule.deleteMany({
      employeeId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
    
    res.json({
      message: `Deleted ${result.deletedCount} schedules`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete schedules error:', error);
    res.status(500).json({ message: 'Error deleting schedules' });
  }
};

// Bulk delete schedules by IDs
export const bulkDeleteSchedulesByIds = async (req, res) => {
  try {
    const { scheduleIds } = req.body;
    
    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return res.status(400).json({ message: 'Schedule IDs array is required' });
    }
    
    // Validate ObjectIds
    const validIds = scheduleIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ message: 'No valid schedule IDs provided' });
    }
    
    const result = await Schedule.deleteMany({
      _id: { $in: validIds }
    });
    
    res.json({
      message: `Deleted ${result.deletedCount} schedules`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete schedules by IDs error:', error);
    res.status(500).json({ message: 'Error deleting schedules', error: error.message });
  }
};

// Bulk update schedules by IDs
export const bulkUpdateSchedules = async (req, res) => {
  try {
    const { scheduleIds, updates } = req.body;
    
    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return res.status(400).json({ message: 'Schedule IDs array is required' });
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates object is required' });
    }
    
    // Validate ObjectIds
    const validIds = scheduleIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ message: 'No valid schedule IDs provided' });
    }
    
    // Only allow certain fields to be updated
    const allowedFields = ['jobCode', 'startTime', 'endTime'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
    
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    const result = await Schedule.updateMany(
      { _id: { $in: validIds } },
      { $set: filteredUpdates }
    );
    
    res.json({
      message: `Updated ${result.modifiedCount} schedules`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update schedules error:', error);
    res.status(500).json({ message: 'Error updating schedules', error: error.message });
  }
};

// Get schedules by date range for bulk operations
export const getSchedulesByDateRangeForBulk = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ date: 1, startTime: 1 });
    
    res.json({
      schedules: schedules.map(schedule => ({
        _id: schedule._id,
        employeeId: schedule.employeeId,
        employeeName: schedule.employee?.name || schedule.employeeName,
        department: schedule.employee?.department,
        date: schedule.date,
        jobCode: schedule.jobCode,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }))
    });
  } catch (error) {
    console.error('Get schedules by date range error:', error);
    res.status(500).json({ message: 'Error fetching schedules' });
  }
};


