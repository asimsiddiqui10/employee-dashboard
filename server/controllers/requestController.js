import Request from '../models/Request.js';

// Create a new request
export const createRequest = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const employeeId = req.user.employee;  // Get employee ID from authenticated user
    
    console.log('Creating request with:', { type, title, description, employeeId });

    // Validate required fields
    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, title, description'
      });
    }

    // Validate request type
    const validTypes = [
      'document_request', 
      'details_change', 
      'leave_request', 
      'payroll_inquiry', 
      'schedule_change', 
      'access_request', 
      'training_request', 
      'equipment_request', 
      'location_change', 
      'team_request', 
      'project_request', 
      'other'
    ];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid request type: ${type}. Valid types are: ${validTypes.join(', ')}`
      });
    }

    const request = new Request({
      employee: employeeId,
      type,
      title,
      description,
      statusHistory: [{
        status: 'pending',
        note: 'Request submitted',
        updatedBy: employeeId
      }]
    });

    await request.save();

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create request',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get all requests (admin)
export const getAllRequests = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const requests = await Request.find(query)
      .populate('employee', 'name employeeId profilePic department')
      .populate('statusHistory.updatedBy', 'name employeeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
};

// Get employee's requests
export const getEmployeeRequests = async (req, res) => {
  try {
    const employeeId = req.user.employee;  // Changed from employeeId to employee to match auth structure
    const requests = await Request.find({ employee: employeeId })
      .populate('employee', 'name employeeId')  // Add employee population
      .populate('statusHistory.updatedBy', 'name employeeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching employee requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
};

// Update request status (admin)
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, note } = req.body;
    const adminId = req.user.employeeId;

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.status = status;
    if (note) request.adminNotes = note;

    request.statusHistory.push({
      status,
      note,
      updatedBy: adminId,
      updatedAt: new Date()
    });

    await request.save();

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status'
    });
  }
};

// Get request by ID
export const getRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId)
      .populate('employee', 'name employeeId profilePic department')
      .populate('statusHistory.updatedBy', 'name employeeId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request'
    });
  }
}; 