import Schedule from '../models/Schedule.js';
import Employee from '../models/Employee.js';
import CompanyDefault from '../models/CompanyDefault.js';

// Helper function to check if a day should be included based on daysOfWeek
const shouldIncludeDay = (date, daysOfWeek) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  
  const dayName = dayMap[dayOfWeek];
  return daysOfWeek && daysOfWeek[dayName] === true;
};

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const { employeeId, jobCode, startDate, endDate, daysOfWeek, hoursPerDay, startTime, endTime, notes } = req.body;
    
    // Validate required fields
    if (!employeeId || !jobCode || !hoursPerDay || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Handle date defaults - if not provided, use today to 1 year from now
    const scheduleStartDate = startDate ? new Date(startDate) : new Date();
    const scheduleEndDate = endDate ? new Date(endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    
    // Create schedule
    const schedule = new Schedule({
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      jobCode,
      startDate: scheduleStartDate,
      endDate: scheduleEndDate,
      daysOfWeek: daysOfWeek || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      hoursPerDay,
      startTime,
      endTime,
      createdBy: req.user._id,
      notes: notes || ''
    });
    
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

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('employee', 'name employeeId department')
      .sort({ startDate: -1 });
    
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Server error fetching schedules' });
  }
};

// Get schedules by employee ID
export const getSchedulesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const schedules = await Schedule.find({ employeeId })
      .sort({ startDate: -1 });
    
    res.json(schedules);
  } catch (error) {
    console.error('Get employee schedules error:', error);
    res.status(500).json({ message: 'Server error fetching employee schedules' });
  }
};

// Get schedules by date range
export const getSchedulesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const schedules = await Schedule.find({
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    }).populate('employee', 'name employeeId');
    
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules by date range error:', error);
    res.status(500).json({ message: 'Server error fetching schedules' });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json({
      message: 'Schedule updated successfully',
      schedule
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

// Company Default Controllers

// Create company default
export const createCompanyDefault = async (req, res) => {
  try {
    const { name, hoursPerDay, startTime, endTime, includeWeekends } = req.body;
    
    if (!name || !hoursPerDay || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const companyDefault = new CompanyDefault({
      name,
      hoursPerDay,
      startTime,
      endTime,
      includeWeekends: includeWeekends || false,
      createdBy: req.user._id
    });
    
    await companyDefault.save();
    
    res.status(201).json({
      message: 'Company default created successfully',
      companyDefault
    });
  } catch (error) {
    console.error('Create company default error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company default with this name already exists' });
    }
    res.status(500).json({ message: 'Server error creating company default' });
  }
};

// Get all company defaults
export const getCompanyDefaults = async (req, res) => {
  try {
    const defaults = await CompanyDefault.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    res.json(defaults);
  } catch (error) {
    console.error('Get company defaults error:', error);
    res.status(500).json({ message: 'Server error fetching company defaults' });
  }
};

// Update company default
export const updateCompanyDefault = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const companyDefault = await CompanyDefault.findByIdAndUpdate(
      id,
      { ...updates, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!companyDefault) {
      return res.status(404).json({ message: 'Company default not found' });
    }
    
    res.json({
      message: 'Company default updated successfully',
      companyDefault
    });
  } catch (error) {
    console.error('Update company default error:', error);
    res.status(500).json({ message: 'Server error updating company default' });
  }
};

// Delete company default
export const deleteCompanyDefault = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyDefault = await CompanyDefault.findByIdAndDelete(id);
    
    if (!companyDefault) {
      return res.status(404).json({ message: 'Company default not found' });
    }
    
    res.json({ message: 'Company default deleted successfully' });
  } catch (error) {
    console.error('Delete company default error:', error);
    res.status(500).json({ message: 'Server error deleting company default' });
  }
};

