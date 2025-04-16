const documentSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  documentType: {
    type: String,
    required: true,
    enum: ['payroll', 'personal', 'company', 'onboarding', 'benefits', 'training']
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

documentSchema.index({ documentType: 1 });
documentSchema.index({ employeeId: 1, documentType: 1 }); 