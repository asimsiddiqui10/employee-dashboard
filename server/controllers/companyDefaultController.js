import CompanyDefault from '../models/CompanyDefault.js';

// Get all company defaults
export const getAllCompanyDefaults = async (req, res) => {
  try {
    const companyDefaults = await CompanyDefault.find({ isActive: true })
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId')
      .sort({ name: 1 });

    res.json(companyDefaults);
  } catch (error) {
    console.error('Error fetching company defaults:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch company defaults' });
  }
};

// Get company default by ID
export const getCompanyDefaultById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyDefault = await CompanyDefault.findById(id)
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId');

    if (!companyDefault) {
      return res.status(404).json({ error: 'Company default not found' });
    }

    res.json(companyDefault);
  } catch (error) {
    console.error('Error fetching company default by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch company default' });
  }
};

// Get default company schedule
export const getDefaultCompanySchedule = async (req, res) => {
  try {
    const companyDefault = await CompanyDefault.getDefault();
    
    if (!companyDefault) {
      return res.status(404).json({ error: 'No default company schedule found' });
    }

    res.json(companyDefault);
  } catch (error) {
    console.error('Error fetching default company schedule:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch default company schedule' });
  }
};

// Create new company default
export const createCompanyDefault = async (req, res) => {
  try {
    const {
      name,
      description,
      schedule,
      defaultJobCode,
      defaultRate,
      isDefault
    } = req.body;

    // Check if name already exists
    const existingDefault = await CompanyDefault.findOne({ name });
    if (existingDefault) {
      return res.status(409).json({ error: 'Company default with this name already exists' });
    }

    const companyDefault = new CompanyDefault({
      name,
      description,
      schedule,
      defaultJobCode,
      defaultRate,
      isDefault: isDefault || false,
      createdBy: req.user._id
    });

    await companyDefault.save();

    const populatedDefault = await CompanyDefault.findById(companyDefault._id)
      .populate('createdBy', 'name employeeId');

    res.status(201).json({
      message: 'Company default created successfully',
      companyDefault: populatedDefault
    });
  } catch (error) {
    console.error('Error creating company default:', error);
    res.status(500).json({ error: error.message || 'Failed to create company default' });
  }
};

// Update company default
export const updateCompanyDefault = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const companyDefault = await CompanyDefault.findById(id);
    if (!companyDefault) {
      return res.status(404).json({ error: 'Company default not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        companyDefault[key] = updateData[key];
      }
    });

    companyDefault.lastModifiedBy = req.user._id;
    await companyDefault.save();

    const updatedDefault = await CompanyDefault.findById(id)
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: 'Company default updated successfully',
      companyDefault: updatedDefault
    });
  } catch (error) {
    console.error('Error updating company default:', error);
    res.status(500).json({ error: error.message || 'Failed to update company default' });
  }
};

// Delete company default
export const deleteCompanyDefault = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyDefault = await CompanyDefault.findById(id);
    if (!companyDefault) {
      return res.status(404).json({ error: 'Company default not found' });
    }

    // Check if it's the default
    if (companyDefault.isDefault) {
      return res.status(400).json({ error: 'Cannot delete the default company schedule' });
    }

    await CompanyDefault.findByIdAndDelete(id);

    res.json({ message: 'Company default deleted successfully' });
  } catch (error) {
    console.error('Error deleting company default:', error);
    res.status(500).json({ error: error.message || 'Failed to delete company default' });
  }
};

// Set company default as default
export const setAsDefault = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyDefault = await CompanyDefault.findById(id);
    if (!companyDefault) {
      return res.status(404).json({ error: 'Company default not found' });
    }

    // Set this as default (will automatically unset others)
    companyDefault.isDefault = true;
    companyDefault.lastModifiedBy = req.user._id;
    await companyDefault.save();

    const updatedDefault = await CompanyDefault.findById(id)
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: 'Company default set as default successfully',
      companyDefault: updatedDefault
    });
  } catch (error) {
    console.error('Error setting company default as default:', error);
    res.status(500).json({ error: error.message || 'Failed to set company default as default' });
  }
};

// Toggle company default status
export const toggleCompanyDefaultStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyDefault = await CompanyDefault.findById(id);
    if (!companyDefault) {
      return res.status(404).json({ error: 'Company default not found' });
    }

    // Don't allow deactivating the default
    if (companyDefault.isDefault) {
      return res.status(400).json({ error: 'Cannot deactivate the default company schedule' });
    }

    companyDefault.isActive = !companyDefault.isActive;
    companyDefault.lastModifiedBy = req.user._id;
    await companyDefault.save();

    const updatedDefault = await CompanyDefault.findById(id)
      .populate('createdBy', 'name employeeId')
      .populate('lastModifiedBy', 'name employeeId');

    res.json({
      message: `Company default ${companyDefault.isActive ? 'activated' : 'deactivated'} successfully`,
      companyDefault: updatedDefault
    });
  } catch (error) {
    console.error('Error toggling company default status:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle company default status' });
  }
}; 