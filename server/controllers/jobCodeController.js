import JobCode from '../models/JobCode.js';

// Get all job codes with pagination and filtering
export const getAllJobCodes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      isActive,
      department,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Build query filters
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (department) query.department = department;
    
    // Search functionality
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const jobCodes = await JobCode.find(query)
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId')
      .sort({ code: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await JobCode.countDocuments(query);

    res.json({
      jobCodes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job codes' });
  }
};

// Get job code by ID
export const getJobCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobCode = await JobCode.findById(id)
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId');

    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }

    res.json(jobCode);
  } catch (error) {
    console.error('Error fetching job code by ID:', error);
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

// Get job codes by category
export const getJobCodesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const jobCodes = await JobCode.getActiveByCategory(category);
    
    res.json(jobCodes);
  } catch (error) {
    console.error('Error fetching job codes by category:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job codes by category' });
  }
};

// Get all active job codes
export const getActiveJobCodes = async (req, res) => {
  try {
    const jobCodes = await JobCode.getAllActive();
    res.json(jobCodes);
  } catch (error) {
    console.error('Error fetching active job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch active job codes' });
  }
};

// Search job codes
export const searchJobCodes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const jobCodes = await JobCode.search(query.trim());
    res.json(jobCodes);
  } catch (error) {
    console.error('Error searching job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to search job codes' });
  }
};

// Create new job code
export const createJobCode = async (req, res) => {
  try {
    const {
      code,
      description,
      category,
      defaultRate,
      minRate,
      maxRate,
      department,
      skills,
      requirements,
      isDefault
    } = req.body;

    // Check if job code already exists
    const existingJobCode = await JobCode.findOne({ code: code.toUpperCase() });
    if (existingJobCode) {
      return res.status(409).json({ error: 'Job code already exists' });
    }

    // Validate rate constraints
    if (minRate && maxRate && minRate > maxRate) {
      return res.status(400).json({ error: 'Minimum rate cannot be greater than maximum rate' });
    }

    if (defaultRate < (minRate || 0)) {
      return res.status(400).json({ error: 'Default rate cannot be less than minimum rate' });
    }

    if (maxRate && defaultRate > maxRate) {
      return res.status(400).json({ error: 'Default rate cannot exceed maximum rate' });
    }

    const jobCode = new JobCode({
      code: code.toUpperCase(),
      description,
      category,
      defaultRate,
      minRate: minRate || 0,
      maxRate,
      department,
      skills: skills || [],
      requirements,
      isDefault: isDefault || false,
      createdBy: req.user._id
    });

    await jobCode.save();

    const populatedJobCode = await JobCode.findById(jobCode._id)
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Job code created successfully',
      jobCode: populatedJobCode
    });
  } catch (error) {
    console.error('Error creating job code:', error);
    res.status(500).json({ error: error.message || 'Failed to create job code' });
  }
};

// Update job code
export const updateJobCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const jobCode = await JobCode.findById(id);
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }

    // Check if updating code and if it conflicts with existing
    if (updateData.code && updateData.code !== jobCode.code) {
      const existingJobCode = await JobCode.findOne({ 
        code: updateData.code.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingJobCode) {
        return res.status(409).json({ error: 'Job code already exists' });
      }
      
      updateData.code = updateData.code.toUpperCase();
    }

    // Validate rate constraints if updating rates
    if (updateData.defaultRate || updateData.minRate || updateData.maxRate) {
      const newDefaultRate = updateData.defaultRate || jobCode.defaultRate;
      const newMinRate = updateData.minRate !== undefined ? updateData.minRate : jobCode.minRate;
      const newMaxRate = updateData.maxRate !== undefined ? updateData.maxRate : jobCode.maxRate;

      if (newMinRate && newMaxRate && newMinRate > newMaxRate) {
        return res.status(400).json({ error: 'Minimum rate cannot be greater than maximum rate' });
      }

      if (newDefaultRate < newMinRate) {
        return res.status(400).json({ error: 'Default rate cannot be less than minimum rate' });
      }

      if (newMaxRate && newDefaultRate > newMaxRate) {
        return res.status(400).json({ error: 'Default rate cannot exceed maximum rate' });
      }
    }

    // Update last modified by
    updateData.lastModifiedBy = req.user._id;

    const updatedJobCode = await JobCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name employeeId')
     .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: 'Job code updated successfully',
      jobCode: updatedJobCode
    });
  } catch (error) {
    console.error('Error updating job code:', error);
    res.status(500).json({ error: error.message || 'Failed to update job code' });
  }
};

// Delete job code
export const deleteJobCode = async (req, res) => {
  try {
    const { id } = req.params;

    const jobCode = await JobCode.findById(id);
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }

    // Check if job code is in use
    // You might want to add a check here to see if any schedules are using this job code
    // For now, we'll allow deletion but you can add this validation later

    await JobCode.findByIdAndDelete(id);

    res.json({ message: 'Job code deleted successfully' });
  } catch (error) {
    console.error('Error deleting job code:', error);
    res.status(500).json({ error: error.message || 'Failed to delete job code' });
  }
};

// Toggle job code active status
export const toggleJobCodeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const jobCode = await JobCode.findById(id);
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }

    // Don't allow deactivating default job code
    if (jobCode.isDefault && jobCode.isActive) {
      return res.status(400).json({ error: 'Cannot deactivate default job code' });
    }

    jobCode.isActive = !jobCode.isActive;
    jobCode.lastModifiedBy = req.user._id;

    await jobCode.save();

    const updatedJobCode = await JobCode.findById(id)
      .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: `Job code ${jobCode.isActive ? 'activated' : 'deactivated'} successfully`,
      jobCode: updatedJobCode
    });
  } catch (error) {
    console.error('Error toggling job code status:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle job code status' });
  }
};

// Set job code as default
export const setDefaultJobCode = async (req, res) => {
  try {
    const { id } = req.params;

    const jobCode = await JobCode.findById(id);
    if (!jobCode) {
      return res.status(404).json({ error: 'Job code not found' });
    }

    if (!jobCode.isActive) {
      return res.status(400).json({ error: 'Cannot set inactive job code as default' });
    }

    jobCode.isDefault = true;
    jobCode.lastModifiedBy = req.user._id;

    await jobCode.save();

    const updatedJobCode = await JobCode.findById(id)
      .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: 'Job code set as default successfully',
      jobCode: updatedJobCode
    });
  } catch (error) {
    console.error('Error setting default job code:', error);
    res.status(500).json({ error: error.message || 'Failed to set default job code' });
  }
};

// Bulk operations
export const bulkUpdateJobCodes = async (req, res) => {
  try {
    const { jobCodeIds, updates } = req.body;

    if (!Array.isArray(jobCodeIds) || jobCodeIds.length === 0) {
      return res.status(400).json({ error: 'Job code IDs array is required' });
    }

    const result = await JobCode.updateMany(
      { _id: { $in: jobCodeIds } },
      { 
        ...updates,
        lastModifiedBy: req.user._id
      }
    );

    res.json({
      message: `${result.modifiedCount} job codes updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to bulk update job codes' });
  }
};

// Get job code statistics
export const getJobCodeStats = async (req, res) => {
  try {
    const stats = await JobCode.aggregate([
      {
        $group: {
          _id: null,
          totalJobCodes: { $sum: 1 },
          activeJobCodes: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveJobCodes: { $sum: { $cond: ['$isActive', 0, 1] } },
          defaultJobCodes: { $sum: { $cond: ['$isDefault', 1, 0] } }
        }
      }
    ]);

    const categoryStats = await JobCode.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDefaultRate: { $avg: '$defaultRate' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const departmentStats = await JobCode.aggregate([
      { $match: { department: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalJobCodes: 0,
        activeJobCodes: 0,
        inactiveJobCodes: 0,
        defaultJobCodes: 0
      },
      categoryBreakdown: categoryStats,
      departmentBreakdown: departmentStats
    });
  } catch (error) {
    console.error('Error fetching job code stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job code stats' });
  }
};

// Import job codes from CSV/JSON
export const importJobCodes = async (req, res) => {
  try {
    const { jobCodes } = req.body;

    if (!Array.isArray(jobCodes) || jobCodes.length === 0) {
      return res.status(400).json({ error: 'Job codes array is required' });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const jobCodeData of jobCodes) {
      try {
        const { code, description, category, defaultRate, minRate, maxRate, department } = jobCodeData;

        if (!code || !description || !defaultRate) {
          results.errors.push({
            code: code || 'N/A',
            error: 'Missing required fields: code, description, or defaultRate'
          });
          continue;
        }

        // Check if job code exists
        const existingJobCode = await JobCode.findOne({ code: code.toUpperCase() });
        
        if (existingJobCode) {
          // Update existing
          const updateData = {
            description,
            category,
            defaultRate,
            minRate,
            maxRate,
            department,
            lastModifiedBy: req.user._id
          };

          await JobCode.findByIdAndUpdate(existingJobCode._id, updateData);
          results.updated++;
        } else {
          // Create new
          const newJobCode = new JobCode({
            code: code.toUpperCase(),
            description,
            category,
            defaultRate,
            minRate: minRate || 0,
            maxRate,
            department,
            createdBy: req.user._id
          });

          await newJobCode.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          code: jobCodeData.code || 'N/A',
          error: error.message
        });
      }
    }

    res.json({
      message: 'Job codes import completed',
      results
    });
  } catch (error) {
    console.error('Error importing job codes:', error);
    res.status(500).json({ error: error.message || 'Failed to import job codes' });
  }
}; 