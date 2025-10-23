import ScheduleTemplate from '../models/ScheduleTemplate.js';

// Get all templates
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await ScheduleTemplate.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ name: 1 });
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error fetching templates' });
  }
};

// Get single template by ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await ScheduleTemplate.findById(id)
      .populate('createdBy', 'name email');
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error fetching template' });
  }
};

// Create new template
export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      jobCode,
      daysOfWeek,
      hoursPerDay,
      startTime,
      endTime,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !hoursPerDay || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Name, hours per day, start time, and end time are required' 
      });
    }

    // Validate time range
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    // Check if template name already exists
    const existingTemplate = await ScheduleTemplate.findOne({ 
      name: name.trim(),
      isActive: true 
    });
    
    if (existingTemplate) {
      return res.status(400).json({ 
        message: 'A template with this name already exists' 
      });
    }

    const template = new ScheduleTemplate({
      name: name.trim(),
      description,
      jobCode: jobCode || null,
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
      notes,
      createdBy: req.user._id
    });

    await template.save();
    
    const populatedTemplate = await ScheduleTemplate.findById(template._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedTemplate);
  } catch (error) {
    console.error('Create template error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A template with this name already exists. Please use a different name.' 
      });
    }
    
    res.status(500).json({ message: 'Server error creating template' });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      jobCode,
      daysOfWeek,
      hoursPerDay,
      startTime,
      endTime,
      notes
    } = req.body;

    const template = await ScheduleTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Validate time range if times are being updated
    if (startTime && endTime) {
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      
      if (endMinutes <= startMinutes) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }
    }

    // Check if new name conflicts with existing template
    if (name && name.trim() !== template.name) {
      const existingTemplate = await ScheduleTemplate.findOne({ 
        name: name.trim(),
        isActive: true,
        _id: { $ne: id }
      });
      
      if (existingTemplate) {
        return res.status(400).json({ 
          message: 'A template with this name already exists' 
        });
      }
    }

    // Update fields
    if (name) template.name = name.trim();
    if (description !== undefined) template.description = description;
    if (jobCode !== undefined) template.jobCode = jobCode || null;
    if (daysOfWeek !== undefined) template.daysOfWeek = daysOfWeek;
    if (hoursPerDay !== undefined) template.hoursPerDay = hoursPerDay;
    if (startTime) template.startTime = startTime;
    if (endTime) template.endTime = endTime;
    if (notes !== undefined) template.notes = notes;

    await template.save();
    
    const updatedTemplate = await ScheduleTemplate.findById(id)
      .populate('createdBy', 'name email');
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Update template error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A template with this name already exists. Please use a different name.' 
      });
    }
    
    res.status(500).json({ message: 'Server error updating template' });
  }
};

// Delete template (soft delete)
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await ScheduleTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Soft delete
    template.isActive = false;
    await template.save();
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error deleting template' });
  }
};

// Duplicate template
export const duplicateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const originalTemplate = await ScheduleTemplate.findById(id);
    
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Create new template with "Copy of" prefix
    let newName = `Copy of ${originalTemplate.name}`;
    let counter = 1;
    
    // Ensure unique name
    while (await ScheduleTemplate.findOne({ name: newName, isActive: true })) {
      newName = `Copy ${counter} of ${originalTemplate.name}`;
      counter++;
    }

    const newTemplate = new ScheduleTemplate({
      name: newName,
      description: originalTemplate.description,
      jobCode: originalTemplate.jobCode,
      daysOfWeek: originalTemplate.daysOfWeek,
      hoursPerDay: originalTemplate.hoursPerDay,
      startTime: originalTemplate.startTime,
      endTime: originalTemplate.endTime,
      notes: originalTemplate.notes,
      createdBy: req.user._id
    });

    await newTemplate.save();
    
    const populatedTemplate = await ScheduleTemplate.findById(newTemplate._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedTemplate);
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({ message: 'Server error duplicating template' });
  }
};

