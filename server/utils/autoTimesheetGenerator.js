import ScheduledWork from '../models/ScheduledWork.js';
import TimeEntry from '../models/TimeEntry.js';
import Employee from '../models/Employee.js';
import { startOfDay, endOfDay, isPast } from 'date-fns';

/**
 * Automatically generate timesheets for all scheduled work that has passed
 * This function can be called by a cron job or scheduled task
 */
export const generateAutomaticTimesheets = async () => {
  try {
    console.log('Starting automatic timesheet generation...');
    
    const today = new Date();
    const startOfToday = startOfDay(today);
    
    // Find all scheduled work that:
    // 1. Has a date in the past (including today)
    // 2. Is still in 'scheduled' status
    // 3. Hasn't generated a timesheet yet
    const scheduledWork = await ScheduledWork.find({
      date: { $lte: startOfToday },
      status: 'scheduled',
      timesheetGenerated: false
    }).populate('employee');

    console.log(`Found ${scheduledWork.length} scheduled work entries to process`);

    const results = {
      generated: [],
      errors: [],
      skipped: []
    };

    for (const schedule of scheduledWork) {
      try {
        // Check if timesheet already exists for this date
        const existingTimesheet = await TimeEntry.findOne({
          employee: schedule.employee._id,
          date: {
            $gte: startOfDay(schedule.date),
            $lte: endOfDay(schedule.date)
          }
        });

        if (existingTimesheet) {
          results.skipped.push({
            employee: schedule.employee.name,
            date: schedule.date,
            reason: 'Timesheet already exists'
          });
          continue;
        }

        // Get employee details for default values
        const employee = await Employee.findById(schedule.employee._id);
        
        // Create automatic timesheet
        const timeEntry = new TimeEntry({
          employee: schedule.employee._id,
          date: schedule.date,
          clockIn: schedule.startTime,
          clockOut: schedule.endTime,
          status: 'completed',
          jobCode: schedule.jobCode, // Use scheduled work's job code
          rate: schedule.rate, // Use scheduled work's rate
          timesheetNotes: `Auto-generated from scheduled work: ${schedule.notes || 'No notes'}`,
          totalWorkTime: Math.floor((schedule.endTime - schedule.startTime) / (1000 * 60)), // Convert to minutes
          totalBreakTime: 0,
          breaks: []
        });

        await timeEntry.save();

        // Update scheduled work as completed
        schedule.status = 'completed';
        schedule.timesheetGenerated = true;
        schedule.timesheetId = timeEntry._id;
        await schedule.save();

        results.generated.push({
          employee: schedule.employee.name,
          date: schedule.date,
          timesheetId: timeEntry._id,
          workTime: timeEntry.totalWorkTime
        });

        console.log(`Generated timesheet for ${schedule.employee.name} on ${schedule.date.toDateString()}`);
      } catch (error) {
        console.error(`Error generating timesheet for ${schedule.employee.name}:`, error);
        results.errors.push({
          employee: schedule.employee.name,
          date: schedule.date,
          error: error.message
        });
      }
    }

    console.log('Automatic timesheet generation completed');
    console.log(`Generated: ${results.generated.length}, Errors: ${results.errors.length}, Skipped: ${results.skipped.length}`);

    return results;
  } catch (error) {
    console.error('Error in automatic timesheet generation:', error);
    throw error;
  }
};

/**
 * Generate timesheets for a specific date range
 */
export const generateTimesheetsForDateRange = async (startDate, endDate) => {
  try {
    console.log(`Generating timesheets for date range: ${startDate} to ${endDate}`);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Find all scheduled work in the date range
    const scheduledWork = await ScheduledWork.find({
      date: { $gte: start, $lte: end },
      status: 'scheduled',
      timesheetGenerated: false
    }).populate('employee');

    console.log(`Found ${scheduledWork.length} scheduled work entries in date range`);

    const results = {
      generated: [],
      errors: [],
      skipped: []
    };

    for (const schedule of scheduledWork) {
      try {
        // Check if timesheet already exists
        const existingTimesheet = await TimeEntry.findOne({
          employee: schedule.employee._id,
          date: {
            $gte: startOfDay(schedule.date),
            $lte: endOfDay(schedule.date)
          }
        });

        if (existingTimesheet) {
          results.skipped.push({
            employee: schedule.employee.name,
            date: schedule.date,
            reason: 'Timesheet already exists'
          });
          continue;
        }

        // Get employee details for default values
        const employee = await Employee.findById(schedule.employee._id);
        
        // Create automatic timesheet
        const timeEntry = new TimeEntry({
          employee: schedule.employee._id,
          date: schedule.date,
          clockIn: schedule.startTime,
          clockOut: schedule.endTime,
          status: 'completed',
          jobCode: 'AUTO001',
          rate: employee.compensationType === 'Hourly Rate' ? employee.compensationValue : 0,
          timesheetNotes: `Auto-generated from scheduled work: ${schedule.notes || 'No notes'}`,
          totalWorkTime: Math.floor((schedule.endTime - schedule.startTime) / (1000 * 1000 * 60)),
          totalBreakTime: 0,
          breaks: []
        });

        await timeEntry.save();

        // Update scheduled work as completed
        schedule.status = 'completed';
        schedule.timesheetGenerated = true;
        schedule.timesheetId = timeEntry._id;
        await schedule.save();

        results.generated.push({
          employee: schedule.employee.name,
          date: schedule.date,
          timesheetId: timeEntry._id,
          workTime: timeEntry.totalWorkTime
        });
      } catch (error) {
        results.errors.push({
          employee: schedule.employee.name,
          date: schedule.date,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating timesheets for date range:', error);
    throw error;
  }
};

/**
 * Clean up orphaned scheduled work entries
 */
export const cleanupOrphanedScheduledWork = async () => {
  try {
    console.log('Starting cleanup of orphaned scheduled work...');
    
    // Find scheduled work that is more than 30 days old and still not completed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orphanedWork = await ScheduledWork.find({
      date: { $lt: thirtyDaysAgo },
      status: 'scheduled',
      timesheetGenerated: false
    });

    console.log(`Found ${orphanedWork.length} orphaned scheduled work entries`);

    for (const work of orphanedWork) {
      // Mark as cancelled
      work.status = 'cancelled';
      work.notes = work.notes ? `${work.notes} (Auto-cancelled - past due)` : 'Auto-cancelled - past due';
      await work.save();
    }

    console.log(`Cleaned up ${orphanedWork.length} orphaned scheduled work entries`);
    return { cleanedCount: orphanedWork.length };
  } catch (error) {
    console.error('Error cleaning up orphaned scheduled work:', error);
    throw error;
  }
}; 