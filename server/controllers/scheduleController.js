import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';
import JobCode from '../models/JobCode.js';

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const { employeeId, dates, timeSlots, isRecurring, notes } = req.body;

    // Validate employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Validate job codes
    for (const slot of timeSlots) {
      if (!slot.isBreak && slot.jobCode) {
        const jobCode = await JobCode.findOne({ code: slot.jobCode, isActive: true });
        if (!jobCode) {
          return res.status(400).json({ 
            message: `Invalid job code: ${slot.jobCode}` 
          });
        }
      }
    }

    // Check for schedule conflicts
    const conflicts = [];
    for (const date of dates) {
      const existingSchedule = await Schedule.findOne({
        employeeId,
        'schedules.date': date
      });

      if (existingSchedule) {
        const existingSlots = existingSchedule.schedules.filter(s => s.date === date);
        for (const newSlot of timeSlots) {
          for (const existingSlot of existingSlots) {
            if (isTimeOverlap(newSlot.startTime, newSlot.endTime, existingSlot.startTime, existingSlot.endTime)) {
              conflicts.push({
                date,
                message: `Time slot ${newSlot.startTime}-${newSlot.endTime} overlaps with existing schedule ${existingSlot.startTime}-${existingSlot.endTime}`
              });
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Schedule conflicts detected',
        conflicts 
      });
    }

    // Create schedule entries for each date
    const scheduleEntries = dates.map(date => ({
      employee: employee._id,
      employeeId,
      schedules: timeSlots.map(slot => ({
        date,
        enabled: true,
        startTime: slot.startTime,
        endTime: slot.endTime,
        hours: calculateHours(slot.startTime, slot.endTime),
        jobCode: slot.jobCode,
        rate: slot.rate || '0',
        isBreak: slot.isBreak || false,
        notes: slot.notes
      })),
      isRecurring,
      createdBy: req.user._id,
      notes
    }));

    // Save all schedule entries
    const savedSchedules = await Schedule.insertMany(scheduleEntries);

    // Populate and return the first schedule as a sample
    const populatedSchedule = await Schedule.findById(savedSchedules[0]._id)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Schedules created successfully',
      schedulesCreated: savedSchedules.length,
      sampleSchedule: populatedSchedule
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to create schedule' });
  }
};

// Get schedules for an employee
export const getEmployeeSchedules = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const schedules = await Schedule.find({ employeeId })
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId')
      .sort({ 'schedules.date': -1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId')
      .sort({ 'schedules.date': -1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};

// Get schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
};

// Update schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSlots, isRecurring, notes } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Validate job codes
    for (const slot of timeSlots) {
      if (!slot.isBreak && slot.jobCode) {
        const jobCode = await JobCode.findOne({ code: slot.jobCode, isActive: true });
        if (!jobCode) {
          return res.status(400).json({ 
            message: `Invalid job code: ${slot.jobCode}` 
          });
        }
      }
    }

    // Update schedule
    schedule.schedules = timeSlots.map(slot => ({
      ...slot,
      enabled: true,
      hours: calculateHours(slot.startTime, slot.endTime),
      rate: slot.rate || '0',
      isBreak: slot.isBreak || false
    }));
    schedule.isRecurring = isRecurring || false;
    schedule.notes = notes;

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId');

    res.json({
      message: 'Schedule updated successfully',
      schedule: populatedSchedule
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update schedule' });
  }
};

// Delete schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await Schedule.findByIdAndDelete(id);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete schedule' });
  }
};

// Helper function to calculate hours between two time strings
const calculateHours = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  
  return Math.max(0, (end - start) / 60);
};

// Helper function to check if two time slots overlap
const isTimeOverlap = (start1, end1, start2, end2) => {
  const [s1h, s1m] = start1.split(':').map(Number);
  const [e1h, e1m] = end1.split(':').map(Number);
  const [s2h, s2m] = start2.split(':').map(Number);
  const [e2h, e2m] = end2.split(':').map(Number);
  
  const start1Mins = s1h * 60 + s1m;
  const end1Mins = e1h * 60 + e1m;
  const start2Mins = s2h * 60 + s2m;
  const end2Mins = e2h * 60 + e2m;
  
  return (start1Mins < end2Mins && end1Mins > start2Mins);
};