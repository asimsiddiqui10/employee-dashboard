import TimeEntry from '../models/TimeEntry.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Employee from '../models/Employee.js'; // Added import for Employee

// Store active sessions in memory
const activeSessions = new Map();

// Clock In
export const clockIn = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    
    // Check if already clocked in
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
    
    // Find active session
    const session = activeSessions.get(employeeId.toString());

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'No active clock-in found'
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

    // Update the time entry
    timeEntry.clockOut = new Date();
    timeEntry.status = 'completed';
    timeEntry.breaks = session.breaks;
    timeEntry.totalBreakTime = session.totalBreakTime;

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
    
    // First check for active session
    const activeSession = activeSessions.get(employeeId.toString());
    if (activeSession) {
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
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid period specified'
        });
    }

    // Get all time entries for the period (both active and completed)
    const timeEntries = await TimeEntry.find({
      clockIn: {
        $gte: startDate,
        $lt: endDate
      }
    }).populate('employee', 'name employeeId profilePic department position');

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

    console.log('Sending time entries to admin:', {
      total: updatedEntries.length,
      active: updatedEntries.filter(e => e.status === 'active').length,
      completed: updatedEntries.filter(e => e.status === 'completed').length
    });

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