import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected']
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add indexes for efficient queries
requestSchema.index({ employee: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

const Request = mongoose.model('Request', requestSchema);

export default Request; 