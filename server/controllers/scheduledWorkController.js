import ScheduledWork from '../models/ScheduledWork.js';
import TimeEntry from '../models/TimeEntry.js';
import Employee from '../models/Employee.js';
import { startOfDay, endOfDay, addDays, format } from 'date-fns';

// Create a new scheduled work entry
export const createScheduledWork = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { date, startTime, endTime, jobCode, rate, notes, recurring, endDate } = req.body;

    // Validate that the employee is full-time/part-time
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.employmentType !== 'Full-time/Part-time') {
      return res.status(400).json({
        success: false,
        message: 'Scheduled work is only available for Full-time/Part-time employees'
      });
    }

    // Parse dates
    const scheduleDate = new Date(date);
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Validate times
    if (startDateTime >= endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    // Validate required fields
    if (!jobCode || !rate) {
      return res.status(400).json({
        success: false,
        message: 'Job code and rate are required'
      });
    }

    // Check for conflicts with existing schedules
    const existingSchedule = await ScheduledWork.findOne({
      employee: employeeId,
      date: scheduleDate,
      status: 'scheduled'
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'A schedule already exists for this date'
      });
    }

    // Create the scheduled work entry
    const scheduledWork = new ScheduledWork({
      employee: employeeId,
      date: scheduleDate,
      startTime: startDateTime,
      endTime: endDateTime,
      jobCode,
      rate: parseFloat(rate),
      notes,
      recurring: recurring || { enabled: false },
      endDate: endDate ? new Date(endDate) : null
    });

    await scheduledWork.save();

    // Populate employee details
    await scheduledWork.populate('employee', 'name employeeId department position');

    res.status(201).json({
      success: true,
      message: 'Work schedule created successfully',
      data: scheduledWork
    });
  } catch (error) {
    console.error('Error creating scheduled work:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating work schedule',
      error: error.message
    });
  }
};

// Get all scheduled work for an employee
export const getScheduledWork = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { status, startDate, endDate } = req.query;

    let query = { employee: employeeId };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const scheduledWork = await ScheduledWork.find(query)
      .populate('employee', 'name employeeId department position')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: scheduledWork
    });
  } catch (error) {
    console.error('Error fetching scheduled work:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scheduled work',
      error: error.message
    });
  }
};

// Update scheduled work
export const updateScheduledWork = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee;
    const updateData = req.body;

    const scheduledWork = await ScheduledWork.findOne({
      _id: id,
      employee: employeeId
    });

    if (!scheduledWork) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled work not found'
      });
    }

    // Don't allow updates if timesheet is already generated
    if (scheduledWork.timesheetGenerated) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update schedule after timesheet is generated'
      });
    }

    // Update the scheduled work
    Object.assign(scheduledWork, updateData);
    await scheduledWork.save();

    await scheduledWork.populate('employee', 'name employeeId department position');

    res.json({
      success: true,
      message: 'Scheduled work updated successfully',
      data: scheduledWork
    });
  } catch (error) {
    console.error('Error updating scheduled work:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating scheduled work',
      error: error.message
    });
  }
};

// Delete scheduled work
export const deleteScheduledWork = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee;

    const scheduledWork = await ScheduledWork.findOne({
      _id: id,
      employee: employeeId
    });

    if (!scheduledWork) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled work not found'
      });
    }

    // Don't allow deletion if timesheet is already generated
    if (scheduledWork.timesheetGenerated) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete schedule after timesheet is generated'
      });
    }

    await ScheduledWork.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Scheduled work deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled work:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting scheduled work',
      error: error.message
    });
  }
};

// Generate automatic timesheet from scheduled work
export const generateAutomaticTimesheet = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { date } = req.body;

    const targetDate = date ? new Date(date) : new Date();
    const startOfTargetDay = startOfDay(targetDate);
    const endOfTargetDay = endOfDay(targetDate);

    // Find scheduled work for the target date
    const scheduledWork = await ScheduledWork.findOne({
      employee: employeeId,
      date: {
        $gte: startOfTargetDay,
        $lte: endOfTargetDay
      },
      status: 'scheduled',
      timesheetGenerated: false
    });

    if (!scheduledWork) {
      return res.status(404).json({
        success: false,
        message: 'No scheduled work found for this date'
      });
    }

    // Check if timesheet already exists
    const existingTimesheet = await TimeEntry.findOne({
      employee: employeeId,
      date: {
        $gte: startOfTargetDay,
        $lte: endOfTargetDay
      }
    });

    if (existingTimesheet) {
      return res.status(400).json({
        success: false,
        message: 'Timesheet already exists for this date'
      });
    }

    // Get employee details for default values
    const employee = await Employee.findById(employeeId);
    
    // Create automatic timesheet
    const timeEntry = new TimeEntry({
      employee: employeeId,
      date: scheduledWork.date,
      clockIn: scheduledWork.startTime,
      clockOut: scheduledWork.endTime,
      status: 'completed',
      jobCode: scheduledWork.jobCode, // Use scheduled work's job code
      rate: scheduledWork.rate, // Use scheduled work's rate
      timesheetNotes: `Auto-generated from scheduled work: ${scheduledWork.notes || 'No notes'}`,
      totalWorkTime: Math.floor((scheduledWork.endTime - scheduledWork.startTime) / (1000 * 60)), // Convert to minutes
      totalBreakTime: 0,
      breaks: []
    });

    await timeEntry.save();

    // Update scheduled work as completed
    scheduledWork.status = 'completed';
    scheduledWork.timesheetGenerated = true;
    scheduledWork.timesheetId = timeEntry._id;
    await scheduledWork.save();

    // Populate employee details
    await timeEntry.populate('employee', 'name employeeId profilePic department position');

    res.status(201).json({
      success: true,
      message: 'Automatic timesheet generated successfully',
      data: timeEntry
    });
  } catch (error) {
    console.error('Error generating automatic timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating automatic timesheet',
      error: error.message
    });
  }
};

// Get today's scheduled work
export const getTodayScheduledWork = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const scheduledWork = await ScheduledWork.findOne({
      employee: employeeId,
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      },
      status: 'scheduled'
    }).populate('employee', 'name employeeId department position');

    res.json({
      success: true,
      data: scheduledWork
    });
  } catch (error) {
    console.error('Error fetching today\'s scheduled work:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s scheduled work',
      error: error.message
    });
  }
};

// Bulk generate timesheets for a date range
export const bulkGenerateTimesheets = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find all scheduled work in the date range
    const scheduledWork = await ScheduledWork.find({
      date: { $gte: start, $lte: end },
      status: 'scheduled',
      timesheetGenerated: false
    }).populate('employee');

    const results = [];
    const errors = [];

    for (const schedule of scheduledWork) {
      try {
        // Check if timesheet already exists
        const existingTimesheet = await TimeEntry.findOne({
          employee: schedule.employee._id,
          date: schedule.date
        });

        if (existingTimesheet) {
          errors.push({
            employee: schedule.employee.name,
            date: schedule.date,
            error: 'Timesheet already exists'
          });
          continue;
        }

        // Create automatic timesheet
        const timeEntry = new TimeEntry({
          employee: schedule.employee._id,
          date: schedule.date,
          clockIn: schedule.startTime,
          clockOut: schedule.endTime,
          status: 'completed',
          jobCode: schedule.jobCode,
          rate: schedule.rate,
          timesheetNotes: `Auto-generated from scheduled work: ${schedule.notes || 'No notes'}`,
          totalWorkTime: Math.floor((schedule.endTime - schedule.startTime) / (1000 * 60)),
          totalBreakTime: 0,
          breaks: []
        });

        await timeEntry.save();

        // Update scheduled work
        schedule.status = 'completed';
        schedule.timesheetGenerated = true;
        schedule.timesheetId = timeEntry._id;
        await schedule.save();

        results.push({
          employee: schedule.employee.name,
          date: schedule.date,
          timesheetId: timeEntry._id
        });
      } catch (error) {
        errors.push({
          employee: schedule.employee.name,
          date: schedule.date,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.length} timesheets`,
      data: {
        generated: results,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Error bulk generating timesheets:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk generating timesheets',
      error: error.message
    });
  }
}; 