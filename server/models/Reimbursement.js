import mongoose from 'mongoose';

const reimbursementSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  category: {
    type: String,
    enum: ['Travel', 'Meals', 'Office Supplies', 'Training', 'Equipment', 'Medical', 'Fuel', 'Accommodation', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  description: {
    type: String,
    required: true,
    maxLength: 500
  },
  expenseDate: {
    type: Date,
    required: true
  },
  receipts: [{
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    maxLength: 500
  },
  approvalDate: {
    type: Date,
    default: null
  },
  paidDate: {
    type: Date,
    default: null
  },
  paidAmount: {
    type: Number,
    default: null
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Paid']
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
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Quarterly'],
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
reimbursementSchema.index({ employee: 1, status: 1 });
reimbursementSchema.index({ status: 1, createdAt: -1 });
reimbursementSchema.index({ reviewedBy: 1 });
reimbursementSchema.index({ expenseDate: -1 });
reimbursementSchema.index({ category: 1 });

// Virtual for total receipt count
reimbursementSchema.virtual('receiptCount').get(function() {
  return this.receipts.length;
});

// Virtual for formatted amount
reimbursementSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD'
  }).format(this.amount);
});

// Virtual for days since submission
reimbursementSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if reimbursement can be edited
reimbursementSchema.methods.canBeEdited = function() {
  return ['Pending', 'Under Review'].includes(this.status);
};

// Method to check if reimbursement can be cancelled
reimbursementSchema.methods.canBeCancelled = function() {
  return ['Pending', 'Under Review'].includes(this.status);
};

// Method to add status history entry
reimbursementSchema.methods.addStatusHistory = function(status, note, updatedBy) {
  this.statusHistory.push({
    status,
    note,
    updatedBy,
    updatedAt: new Date()
  });
};

// Pre-save middleware to update status history
reimbursementSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.addStatusHistory(this.status, `Status changed to ${this.status}`, this.reviewedBy);
    
    if (this.status === 'Approved') {
      this.approvalDate = new Date();
    } else if (this.status === 'Paid') {
      this.paidDate = new Date();
      if (!this.paidAmount) {
        this.paidAmount = this.amount;
      }
    }
  }
  next();
});

// Ensure virtual fields are serialized
reimbursementSchema.set('toJSON', { virtuals: true });
reimbursementSchema.set('toObject', { virtuals: true });

export default mongoose.model('Reimbursement', reimbursementSchema); 