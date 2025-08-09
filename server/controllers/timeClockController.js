import TimeEntry from '../models/TimeEntry.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Employee from '../models/Employee.js'; // Added import for Employee

// Store active sessions in memory
const activeSessions = new Map();

// Clock In
export const clockIn = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    
    // First, check database for any existing active entries
    const existingActiveEntry = await TimeEntry.findOne({
      employee: employeeId,
      status: 'active'
    }).populate('employee', 'name employeeId profilePic department position');
    
    if (existingActiveEntry) {
      // Restore to activeSessions if it exists in DB but not in memory
      const session = {
        ...existingActiveEntry.toObject(),
        _id: existingActiveEntry._id
      };
      activeSessions.set(employeeId.toString(), session);
      
      console.log('Found existing active entry, restored to memory:', existingActiveEntry._id);
      
      return res.status(400).json({
        success: false,
        message: 'You are already clocked in',
        data: existingActiveEntry
      });
    }
    
    // Also check in-memory sessions (backup check)
    if (activeSessions.has(employeeId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You are already clocked in'
      });
    }

    // Create new time entry in database
    const timeEntry = new TimeEntry({
      employee: employeeId,
      clockIn: new Date(),
      date: new Date(),
      breaks: [],
      totalBreakTime: 0,
      status: 'active'
    });

    // Save to database
    await timeEntry.save();

    // Also store in memory for quick access
    const session = {
      ...timeEntry.toObject(),
      _id: timeEntry._id // Keep the same ID as database entry
    };

    // Store in memory
    activeSessions.set(employeeId.toString(), session);
    
    console.log('New clock-in created:', timeEntry._id);
    console.log('Active sessions after clock in:', Array.from(activeSessions.entries())); // Debug log

    // Populate employee details before sending response
    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('employee', 'name employeeId profilePic department position');

    res.status(201).json({
      success: true,
      data: populatedEntry
    });
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({
      success: false,
      message: 'Error clocking in',
      error: error.message
    });
  }
};

// Clock Out
export const clockOut = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { jobCode, rate, timesheetNotes } = req.body;
    
    // Find active session in memory
    let session = activeSessions.get(employeeId.toString());

    // If not in memory, check database for active entry
    if (!session) {
      const activeEntry = await TimeEntry.findOne({
        employee: employeeId,
        status: 'active'
      });
      
      if (activeEntry) {
        // Restore to memory for clock-out process
        session = {
          ...activeEntry.toObject(),
          _id: activeEntry._id
        };
        activeSessions.set(employeeId.toString(), session);
        console.log('Found active entry in DB for clock-out, restored to memory:', activeEntry._id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'No active clock-in found'
        });
      }
    }

    // Validate required fields
    if (!jobCode || !rate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide jobCode and rate'
      });
    }

    // Find and update the existing time entry
    const timeEntry = await TimeEntry.findById(session._id);
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }

    // Update the time entry with form data
    timeEntry.clockOut = new Date();
    timeEntry.status = 'completed';
    timeEntry.breaks = session.breaks;
    timeEntry.totalBreakTime = session.totalBreakTime;
    timeEntry.jobCode = jobCode;
    timeEntry.rate = rate;
    timeEntry.timesheetNotes = timesheetNotes;
    timeEntry.managerApproval = {
      status: 'pending',
      approvedBy: null,
      approvalDate: null,
      approvalNotes: null
    };

    // Calculate total work time
    timeEntry.calculateTotalTime();
    
    // Save to database
    await timeEntry.save();

    // Remove active session
    activeSessions.delete(employeeId.toString());
    
    console.log('Active sessions after clock out:', Array.from(activeSessions.entries())); // Debug log

    // Populate employee details before sending response
    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('employee', 'name employeeId profilePic department position');

    res.json({
      success: true,
      data: populatedEntry
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({
      success: false,
      message: 'Error clocking out',
      error: error.message
    });
  }
};

// Manager Approval
export const managerApprove = async (req, res) => {
  try {
    const { timeEntryId } = req.params;
    const { status, notes } = req.body;
    const managerId = req.user.employee;

    // Verify manager role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can approve timesheets'
      });
    }

    // Find the time entry
    const timeEntry = await TimeEntry.findById(timeEntryId);
    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }

    // Update approval status
    timeEntry.managerApproval = {
      status: status,
      approvedBy: managerId,
      approvalDate: new Date(),
      approvalNotes: notes
    };

    // Save changes
    await timeEntry.save();

    // Populate and return updated entry
    const populatedEntry = await TimeEntry.findById(timeEntry._id)
      .populate('employee', 'name employeeId profilePic department position')
      .populate('managerApproval.approvedBy', 'name employeeId');

    res.json({
      success: true,
      data: populatedEntry
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating approval status',
      error: error.message
    });
  }
};

// Start Break
export const startBreak = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    
    // Find active session
    const session = activeSessions.get(employeeId.toString());

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'No active clock-in found'
      });
    }

    // Check if there's an active break
    const activeBreak = session.breaks.find(b => !b.endTime);
    if (activeBreak) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active break'
      });
    }

    // Add new break
    session.breaks.push({
      startTime: new Date()
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting break',
      error: error.message
    });
  }
};

// End Break
export const endBreak = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    
    // Find active session
    const session = activeSessions.get(employeeId.toString());

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'No active clock-in found'
      });
    }

    // Find active break
    const activeBreak = session.breaks.find(b => !b.endTime);
    if (!activeBreak) {
      return res.status(400).json({
        success: false,
        message: 'No active break found'
      });
    }

    // Update break
    activeBreak.endTime = new Date();
    activeBreak.duration = Math.floor(
      (activeBreak.endTime - activeBreak.startTime) / (1000 * 60)
    );

    // Update total break time
    session.totalBreakTime = session.breaks.reduce(
      (total, b) => total + (b.duration || 0),
      0
    );

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending break',
      error: error.message
    });
  }
};

// Get Today's Time Entry
export const getTodayTimeEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // If admin and requesting all entries
    if (req.user.role === 'admin' && req.path.endsWith('/all')) {
      // Get completed entries from database
      const completedEntries = await TimeEntry.find({
        clockIn: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('employee', 'name employeeId profilePic department position');

      // Get active sessions and convert them to the same format
      const activeSessionEntries = Array.from(activeSessions.values()).map(session => ({
        ...session,
        employee: session.employee, // This will be populated by the next query
        status: 'active'
      }));

      // Populate employee details for active sessions
      const populatedActiveSessions = await TimeEntry.populate(activeSessionEntries, {
        path: 'employee',
        select: 'name employeeId profilePic department position'
      });

      // Combine and return both active and completed entries
      const allEntries = [...populatedActiveSessions, ...completedEntries];
      return res.json(allEntries);
    }

    // For individual employee
    const employeeId = req.user.employee;
    
    // First check for active session in memory
    let activeSession = activeSessions.get(employeeId.toString());
    
    if (!activeSession) {
      // If not in memory, check database for active entry
      const activeEntry = await TimeEntry.findOne({
        employee: employeeId,
        status: 'active'
      }).populate('employee', 'name employeeId profilePic department position');
      
      if (activeEntry) {
        // Restore to memory
        activeSession = {
          ...activeEntry.toObject(),
          _id: activeEntry._id
        };
        activeSessions.set(employeeId.toString(), activeSession);
        
        console.log('Found active entry in DB, restored to memory:', activeEntry._id);
        
        return res.json({
          success: true,
          data: activeEntry
        });
      }
    } else {
      return res.json({
        success: true,
        data: activeSession
      });
    }

    // If no active session, check database for today's completed entry
    const timeEntry = await TimeEntry.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today)
      },
      status: 'completed'
    });

    res.json({
      success: true,
      data: timeEntry || null
    });
  } catch (error) {
    console.error('Error fetching time entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching time entry',
      error: error.message
    });
  }
};

// Get Time Entries
export const getTimeEntries = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { startDate, endDate } = req.query;

    const query = {
      employee: employeeId,
      status: 'completed' // Only get completed entries
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const timeEntries = await TimeEntry.find(query)
      .sort({ date: -1 });

    res.json({
      success: true,
      data: timeEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching time entries',
      error: error.message
    });
  }
};

// Get Time Summary
export const getTimeSummary = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const now = new Date();

    // Get today's entries
    const todayEntries = await TimeEntry.find({
      employee: employeeId,
      date: {
        $gte: startOfDay(now),
        $lte: endOfDay(now)
      },
      status: 'completed'
    });

    // Get this week's entries
    const weekEntries = await TimeEntry.find({
      employee: employeeId,
      date: {
        $gte: startOfWeek(now),
        $lte: endOfDay(now)
      },
      status: 'completed'
    });

    // Get this month's entries
    const monthEntries = await TimeEntry.find({
      employee: employeeId,
      date: {
        $gte: startOfMonth(now),
        $lte: endOfDay(now)
      },
      status: 'completed'
    });

    // Calculate totals
    const calculateTotal = (entries) => {
      return entries.reduce((total, entry) => total + (entry.totalWorkTime || 0), 0);
    };

    res.json({
      success: true,
      data: {
        today: calculateTotal(todayEntries),
        week: calculateTotal(weekEntries),
        month: calculateTotal(monthEntries)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching time summary',
      error: error.message
    });
  }
};

export const getAllTodayEntries = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await TimeEntry.find({
      clockIn: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('employee', 'name employeeId profilePic department position');

    res.json(entries);
  } catch (error) {
    console.error('Error fetching today\'s time entries:', error);
    res.status(500).json({ message: 'Failed to fetch time entries' });
  }
};

// Get Time Entries by Period
export const getTimeEntriesByPeriod = async (req, res) => {
  try {
    const period = req.params.period;
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'all':
        // For 'all', don't set date filters - get all entries
        startDate = null;
        endDate = null;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid period specified'
        });
    }

    // Get all time entries for the period (both active and completed)
    let query = {};
    if (startDate && endDate) {
      query.clockIn = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const timeEntries = await TimeEntry.find(query)
    .populate('employee', 'name employeeId profilePic department position')
    .populate('managerApproval.approvedBy', 'name employeeId')
    .sort({ clockIn: -1 }) // Sort by most recent first
    .limit(1000); // Limit to prevent performance issues

    // Update any active entries with the latest data from memory
    const updatedEntries = timeEntries.map(entry => {
      const activeSession = activeSessions.get(entry.employee?._id.toString());
      if (activeSession && activeSession._id.toString() === entry._id.toString()) {
        return {
          ...entry.toObject(),
          breaks: activeSession.breaks,
          totalBreakTime: activeSession.totalBreakTime
        };
      }
      return entry;
    });

    // Count entries by status
    const stats = {
      total: updatedEntries.length,
      active: updatedEntries.filter(e => e.status === 'active').length,
      completed: updatedEntries.filter(e => e.status === 'completed').length,
      pending: updatedEntries.filter(e => e.managerApproval?.status === 'pending').length
    };

    console.log('Sending time entries to admin:', stats);

    res.json(updatedEntries);

  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching time entries',
      error: error.message
    });
  }
};

// Cleanup orphaned active entries for an employee
export const cleanupOrphanedEntries = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    
    // Find all active entries for this employee
    const activeEntries = await TimeEntry.find({
      employee: employeeId,
      status: 'active'
    }).sort({ clockIn: -1 });
    
    if (activeEntries.length > 1) {
      // Keep the most recent one, mark others as completed
      const latestEntry = activeEntries[0];
      const orphanedEntries = activeEntries.slice(1);
      
      console.log(`Found ${orphanedEntries.length} orphaned entries for employee ${employeeId}`);
      
      // Mark orphaned entries as completed with minimal work time
      for (const entry of orphanedEntries) {
        entry.status = 'completed';
        entry.clockOut = entry.clockIn; // Set clockOut to clockIn time (0 work time)
        entry.totalWorkTime = 0;
        entry.jobCode = 'CLEANUP';
        entry.rate = 0;
        entry.timesheetNotes = 'Auto-completed during cleanup - orphaned entry';
        await entry.save();
        console.log(`Cleaned up orphaned entry: ${entry._id}`);
      }
      
      // Restore the latest entry to activeSessions
      const session = {
        ...latestEntry.toObject(),
        _id: latestEntry._id
      };
      activeSessions.set(employeeId.toString(), session);
      
      res.json({
        success: true,
        message: `Cleaned up ${orphanedEntries.length} orphaned entries`,
        data: {
          cleanedEntries: orphanedEntries.length,
          activeEntry: latestEntry
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No orphaned entries found',
        data: {
          cleanedEntries: 0,
          activeEntry: activeEntries[0] || null
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up orphaned entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up entries',
      error: error.message
    });
  }
};

// Server startup recovery function - recover active sessions from database
export const recoverActiveSessions = async () => {
  try {
    console.log('Recovering active sessions from database...');
    
    const activeEntries = await TimeEntry.find({ status: 'active' })
      .populate('employee', 'name employeeId');
    
    let recoveredCount = 0;
    
    for (const entry of activeEntries) {
      if (entry.employee) {
        const session = {
          ...entry.toObject(),
          _id: entry._id
        };
        activeSessions.set(entry.employee._id.toString(), session);
        recoveredCount++;
      }
    }
    
    console.log(`Successfully recovered ${recoveredCount} active sessions`);
    
    // Also check for potential orphaned entries and log them
    const employeeActiveCounts = {};
    activeEntries.forEach(entry => {
      const empId = entry.employee?._id?.toString();
      if (empId) {
        employeeActiveCounts[empId] = (employeeActiveCounts[empId] || 0) + 1;
      }
    });
    
    const employeesWithMultipleActive = Object.entries(employeeActiveCounts)
      .filter(([_, count]) => count > 1);
    
    if (employeesWithMultipleActive.length > 0) {
      console.warn('WARNING: Found employees with multiple active entries:', employeesWithMultipleActive);
      console.warn('Consider running cleanup for these employees');
    }
    
    return { recoveredCount, potentialOrphans: employeesWithMultipleActive.length };
  } catch (error) {
    console.error('Error recovering active sessions:', error);
    return { recoveredCount: 0, error: error.message };
  }
};