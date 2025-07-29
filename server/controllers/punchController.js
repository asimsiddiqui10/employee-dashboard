import PunchEntry from '../models/PunchEntry.js';
import { startOfDay, endOfDay } from 'date-fns';
import Employee from '../models/Employee.js';

// Store active punch sessions in memory
const activePunchSessions = new Map();

// Punch In (Mark Attendance)
export const punchIn = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    // Check if already punched in today
    const existingPunch = await PunchEntry.findOne({
      employee: employeeId,
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });

    if (existingPunch) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }

    // Create new punch entry in database
    const punchEntry = new PunchEntry({
      employee: employeeId,
      punchIn: new Date(),
      date: new Date(),
      status: 'active'
    });

    // Save to database
    await punchEntry.save();

    // Store in memory for quick access
    const session = {
      ...punchEntry.toObject(),
      _id: punchEntry._id
    };

    activePunchSessions.set(employeeId.toString(), session);
    
    console.log('Active punch sessions after punch in:', Array.from(activePunchSessions.entries()));

    // Populate employee details before sending response
    const populatedEntry = await PunchEntry.findById(punchEntry._id)
      .populate('employee', 'name employeeId profilePic department position');

    res.status(201).json({
      success: true,
      data: populatedEntry
    });
  } catch (error) {
    console.error('Error punching in:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Get today's punch entry
export const getTodayPunchEntry = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // First check memory for active session
    const activeSession = activePunchSessions.get(employeeId.toString());
    
    if (activeSession) {
      const populatedEntry = await PunchEntry.findById(activeSession._id)
        .populate('employee', 'name employeeId profilePic department position');
      
      return res.json({
        success: true,
        data: populatedEntry
      });
    }

    // If no active session, check database for today's entry
    const punchEntry = await PunchEntry.findOne({
      employee: employeeId,
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('employee', 'name employeeId profilePic department position');

    res.json({
      success: true,
      data: punchEntry
    });
  } catch (error) {
    console.error('Error fetching today\'s punch entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching punch entry',
      error: error.message
    });
  }
};

// Get punch entries for a period
export const getPunchEntries = async (req, res) => {
  try {
    const employeeId = req.user.employee;
    const { startDate, endDate } = req.query;

    let query = { employee: employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const punchEntries = await PunchEntry.find(query)
      .populate('employee', 'name employeeId profilePic department position')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: punchEntries
    });
  } catch (error) {
    console.error('Error fetching punch entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching punch entries',
      error: error.message
    });
  }
}; 