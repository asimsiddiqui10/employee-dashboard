import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  documentType: {
    type: String,
    required: true,
    enum: ['personal', 'company', 'onboarding', 'benefits', 'training']
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

// Only try to delete if the model exists
try {
  if (mongoose.models.Document) {
    mongoose.deleteModel('Document');
  }
} catch (error) {
  console.error('Error while cleaning up Document model:', error);
}

const Document = mongoose.model('Document', documentSchema);
export default Document; 