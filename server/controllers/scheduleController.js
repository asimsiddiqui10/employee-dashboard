import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';
import JobCode from '../models/JobCode.js';

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const { employeeId, schedules, isRecurring, notes } = req.body;

    console.log('Received schedule creation request:', req.body);

    // Validate employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('Employee found:', employee.name);

    // Validate job codes
    for (const daySchedule of schedules) {
      if (daySchedule.enabled && daySchedule.jobCode) {
        const jobCode = await JobCode.findOne({ code: daySchedule.jobCode, isActive: true });
        if (!jobCode) {
          return res.status(400).json({ 
            error: `Invalid job code: ${daySchedule.jobCode}` 
          });
        }
      }
    }

    console.log('Job code validation completed successfully');

    // Create schedule
    const schedule = new Schedule({
      employee: employee._id,
      employeeId,
      schedules: schedules.map(s => ({
        ...s,
        date: s.date,
        rate: s.rate === 'NA' ? 'NA' : (parseFloat(s.rate) || 0), // Handle 'NA' or convert to number
        isBreak: s.isBreak || false
      })),
      isRecurring: isRecurring || false,
      createdBy: req.user._id,
      notes
    });

    console.log('Creating schedule:', schedule);

    await schedule.save();
    console.log('Schedule saved successfully');

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: populatedSchedule
    });

  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get schedules for an employee
export const getEmployeeSchedules = async (req, res) => {
  try {
    const { employeeId } = req.params;

    console.log('getEmployeeSchedules called with employeeId:', employeeId);

    const schedules = await Schedule.find({ employeeId })
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId')
      .sort({ _id: -1 }); // Sort by newest first

    console.log('Found schedules:', schedules.length);

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching employee schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('employee', 'name employeeId department')
      .populate('createdBy', 'name employeeId')
      .sort({ _id: -1 });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedules, isRecurring, notes } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Validate job codes
    for (const daySchedule of schedules) {
      if (daySchedule.enabled && daySchedule.jobCode) {
        const jobCode = await JobCode.findOne({ code: daySchedule.jobCode, isActive: true });
        if (!jobCode) {
          return res.status(400).json({ 
            error: `Invalid job code: ${daySchedule.jobCode}` 
          });
        }
      }
    }

    // Update schedule
    schedule.schedules = schedules.map(s => ({
      ...s,
      date: s.date,
      rate: s.rate === 'NA' ? 'NA' : (parseFloat(s.rate) || 0), // Handle 'NA' or convert to number
      isBreak: s.isBreak || false
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
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    await Schedule.findByIdAndDelete(id);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};