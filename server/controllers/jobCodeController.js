import JobCode from '../models/JobCode.js';
import Employee from '../models/Employee.js';

// Get all job codes with pagination and filtering
export const getAllJobCodes = async (req, res) => {
  try {
    console.log('getAllJobCodes called with query:', req.query);
    
    const { page = 1, limit = 10, search = '', isActive = '' } = req.query;
    
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    

    
    // Active status filter
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    console.log('Final query:', query);
    
    const skip = (page - 1) * limit;
    
    console.log('About to query database...');
    const [jobCodes, total] = await Promise.all([
      JobCode.find(query)
        .populate('assignedTo.employee', 'name employeeId email')
        .sort({ code: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobCode.countDocuments(query)
    ]);
    
    console.log(`Found ${jobCodes.length} job codes, total: ${total}`);
    
    res.json({
      jobCodes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching job codes:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to fetch job codes' });
  }
};

// Get job code by ID
export const getJobCodeById = async (req, res) => {
  try {
    const jobCode = await JobCode.findById(req.params.id)
      .populate('assignedTo.employee', 'name employeeId email');
    
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    res.json(jobCode);
  } catch (error) {
    console.error('Error fetching job code:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job code' });
  }
};

// Get default job code
export const getDefaultJobCode = async (req, res) => {
  try {
    const defaultJobCode = await JobCode.getDefault();
    
    if (!defaultJobCode) {
      return res.status(404).json({ error: 'No default job code found' });
    }
    
    res.json(defaultJobCode);
  } catch (error) {
    console.error('Error fetching default job code:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch default job code' });
  }
};



// Get all active job codes
export const getActiveJobCodes = async (req, res) => {
  try {
    const jobCodes = await JobCode.find({ isActive: true })
      .populate('assignedTo.employee', 'name employeeId email')
      .sort({ title: 1 });
    res.json(jobCodes);
  } catch (error) {
    console.error('Error fetching active job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch active job codes' });
  }
};

// Debug endpoint to check existing job codes
export const debugJobCodes = async (req, res) => {
  try {
    console.log('Debug endpoint called');
    const jobCodes = await JobCode.find({}, 'code title isActive rate assignedTo');
    console.log('All job codes in database:', jobCodes);
    res.json({ jobCodes, count: jobCodes.length });
  } catch (error) {
    console.error('Error fetching debug job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch debug job codes' });
  }
};

// Assign job code to employees
export const assignJobCodeToEmployees = async (req, res) => {
  try {
    console.log('assignJobCodeToEmployees called with params:', req.params);
    console.log('assignJobCodeToEmployees called with body:', req.body);
    
    const { id: jobCodeId } = req.params;
    const { employeeIds, assignedRate, isPrimary, notes } = req.body;
    
    console.log('Looking for job code with ID:', jobCodeId);
    const jobCode = await JobCode.findById(jobCodeId);
    if (!jobCode) {
      console.log('Job code not found for ID:', jobCodeId);
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    console.log('Found job code:', jobCode.code);
    console.log('Employee IDs to assign:', employeeIds);
    
    // Assign to each employee
    for (const employeeId of employeeIds) {
      console.log('Assigning employee:', employeeId);
      jobCode.assignToEmployee(employeeId, assignedRate, isPrimary, notes);
    }
    
    console.log('Saving job code...');
    await jobCode.save();
    console.log('Job code saved successfully');
    
    const populatedJobCode = await JobCode.findById(jobCodeId)
      .populate('assignedTo.employee', 'name employeeId email');
    
    console.log('Returning populated job code');
    res.json(populatedJobCode);
  } catch (error) {
    console.error('Error assigning job code to employees:', error);
    res.status(500).json({ error: error.message || 'Failed to assign job code to employees' });
  }
};

// Remove job code from employees
export const removeJobCodeFromEmployees = async (req, res) => {
  try {
    console.log('removeJobCodeFromEmployees called with params:', req.params);
    console.log('removeJobCodeFromEmployees called with body:', req.body);
    
    const { id: jobCodeId } = req.params;
    const { employeeIds } = req.body;
    
    console.log('Looking for job code with ID:', jobCodeId);
    const jobCode = await JobCode.findById(jobCodeId);
    if (!jobCode) {
      console.log('Job code not found for ID:', jobCodeId);
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    console.log('Found job code:', jobCode.code);
    console.log('Employee IDs to remove:', employeeIds);
    
    // Remove from each employee
    for (const employeeId of employeeIds) {
      console.log('Removing employee:', employeeId);
      jobCode.removeFromEmployee(employeeId);
    }
    
    console.log('Saving job code...');
    await jobCode.save();
    console.log('Job code saved successfully');
    
    const populatedJobCode = await JobCode.findById(jobCodeId)
      .populate('assignedTo.employee', 'name employeeId email');
    
    console.log('Returning populated job code');
    res.json(populatedJobCode);
  } catch (error) {
    console.error('Error removing job code from employees:', error);
    res.status(500).json({ error: error.message || 'Failed to remove job code from employees' });
  }
};

// Get job codes by employee
export const getJobCodesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const jobCodes = await JobCode.find({
      'assignedTo.employee': employeeId,
      isActive: true
    }).populate('assignedTo.employee', 'name employeeId email');
    
    res.json(jobCodes);
  } catch (error) {
    console.error('Error fetching job codes by employee:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job codes by employee' });
  }
};

// Create new job code
export const createJobCode = async (req, res) => {
  try {
    console.log('Creating job code with data:', req.body);
    console.log('User from request:', req.user);
    console.log('Request headers:', req.headers);
    
    // Check if user is authenticated
    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const {
      code,
      title,
      description,
      rate,
      isDefault
    } = req.body;
    
    // Validate required fields
    if (!code || !title) {
      console.log('Missing required fields - code:', code, 'title:', title);
      return res.status(400).json({ error: 'Job code and title are required' });
    }

    // Check if job code already exists
    console.log('Checking for existing job code with code:', code);
    const existingJobCode = await JobCode.findOne({ code: code.toUpperCase() });
    console.log('Existing job code found:', existingJobCode);
    if (existingJobCode) {
      return res.status(400).json({ error: `Job code '${code.toUpperCase()}' already exists` });
    }
    
    const jobCode = new JobCode({
      code: code.toUpperCase(),
      title,
      description,
      rate: rate || 'NA',
      isDefault: isDefault || false
    });
    
    console.log('Job code object before save:', jobCode);
    console.log('Job code object keys:', Object.keys(jobCode));
    console.log('Job code object values:', Object.values(jobCode));
    
    try {
      await jobCode.save();
      console.log('Job code saved successfully');
    } catch (saveError) {
      console.error('Error during save:', saveError);
      throw saveError;
    }
    
    res.status(201).json(jobCode);
  } catch (error) {
    console.error('Error creating job code:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Handle database connection errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to create job code' });
  }
};

// Update job code
export const updateJobCode = async (req, res) => {
  try {
    const {
      title,
      description,
      rate,
      isActive,
      isDefault
    } = req.body;
    
    const jobCode = await JobCode.findById(req.params.id);
    
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    // Update fields
    if (title !== undefined) jobCode.title = title;
    if (description !== undefined) jobCode.description = description;
    if (rate !== undefined) jobCode.rate = rate;
    if (isActive !== undefined) jobCode.isActive = isActive;
    if (isDefault !== undefined) jobCode.isDefault = isDefault;
    
    await jobCode.save();
    
    const updatedJobCode = await JobCode.findById(jobCode._id);
    
    res.json(updatedJobCode);
  } catch (error) {
    console.error('Error updating job code:', error);
    res.status(500).json({ error: error.message || 'Failed to update job code' });
  }
};

// Delete job code (soft delete)
export const deleteJobCode = async (req, res) => {
  try {
    const jobCode = await JobCode.findById(req.params.id);
    
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    // Check if job code is assigned to any employees
    if (jobCode.assignedTo && jobCode.assignedTo.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete job code. It is currently assigned to employees.',
        assignedCount: jobCode.assignedTo.length
      });
    }
    
    // Soft delete
    jobCode.isActive = false;
    await jobCode.save();
    
    res.json({ message: 'Job code deleted successfully' });
  } catch (error) {
    console.error('Error deleting job code:', error);
    res.status(500).json({ error: error.message || 'Failed to delete job code' });
  }
};

// Set job code as default
export const setAsDefault = async (req, res) => {
  try {
    const jobCode = await JobCode.findById(req.params.id);
    
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    jobCode.isDefault = true;
    
    await jobCode.save();
    
    res.json({ message: 'Job code set as default successfully' });
  } catch (error) {
    console.error('Error setting job code as default:', error);
    res.status(500).json({ error: error.message || 'Failed to set job code as default' });
  }
};

// Toggle job code status
export const toggleJobCodeStatus = async (req, res) => {
  try {
    const jobCode = await JobCode.findById(req.params.id);
    
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }
    
    jobCode.isActive = !jobCode.isActive;
    
    await jobCode.save();
    
    res.json({ 
      message: `Job code ${jobCode.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: jobCode.isActive
    });
  } catch (error) {
    console.error('Error toggling job code status:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle job code status' });
  }
};

// Get job code statistics
export const getJobCodeStats = async (req, res) => {
  try {
    const [totalJobCodes, activeJobCodes, inactiveJobCodes, defaultJobCode] = await Promise.all([
      JobCode.countDocuments(),
      JobCode.countDocuments({ isActive: true }),
      JobCode.countDocuments({ isActive: false }),
      JobCode.findOne({ isDefault: true, isActive: true })
    ]);
    
    // Get assignment statistics
    const assignmentStats = await JobCode.aggregate([
      { $match: { isActive: true } },
      { $project: { 
        code: 1, 
        title: 1, 
        assignmentCount: { $size: { $ifNull: ['$assignedTo', []] } }
      }},
      { $sort: { assignmentCount: -1 } }
    ]);
    
    res.json({
      total: totalJobCodes,
      active: activeJobCodes,
      inactive: inactiveJobCodes,
      default: defaultJobCode ? defaultJobCode.code : null,
      byAssignment: assignmentStats
    });
  } catch (error) {
    console.error('Error fetching job code statistics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job code statistics' });
  }
};

// Bulk create job codes
export const bulkCreateJobCodes = async (req, res) => {
  try {
    const { jobCodes } = req.body;
    
    if (!Array.isArray(jobCodes) || jobCodes.length === 0) {
      return res.status(400).json({ error: 'Invalid job codes data' });
    }
    
    const createdJobCodes = [];
    const errors = [];
    
    for (const jobCodeData of jobCodes) {
      try {
        // Check if job code already exists
        const existingJobCode = await JobCode.findOne({ code: jobCodeData.code.toUpperCase() });
        if (existingJobCode) {
          errors.push({ code: jobCodeData.code, error: 'Job code already exists' });
          continue;
        }
        
        const jobCode = new JobCode({
          ...jobCodeData,
          code: jobCodeData.code.toUpperCase(),
          rate: jobCodeData.rate || 'NA'
        });
        
        await jobCode.save();
        createdJobCodes.push(jobCode);
      } catch (error) {
        errors.push({ code: jobCodeData.code, error: error.message });
      }
    }
    
    res.json({
      created: createdJobCodes.length,
      errors,
      jobCodes: createdJobCodes
    });
  } catch (error) {
    console.error('Error bulk creating job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to bulk create job codes' });
  }
};

// Export job codes
export const exportJobCodes = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const jobCodes = await JobCode.find({ isActive: true })
      .populate('assignedTo.employee', 'name employeeId')
      .sort({ code: 1 });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = jobCodes.map(jobCode => ({
        Code: jobCode.code,
        Title: jobCode.title,
        Description: jobCode.description,
        Rate: jobCode.rate,
        AssignedEmployees: jobCode.assignedTo?.map(a => a.employee?.name || 'Unknown').join('; ') || 'None',
        IsDefault: jobCode.isDefault,
        Created: jobCode.createdAt
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=job-codes.csv');
      
      // Convert to CSV string
      const csvString = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      res.send(csvString);
    } else {
      res.json(jobCodes);
    }
  } catch (error) {
    console.error('Error exporting job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to export job codes' });
  }
}; 