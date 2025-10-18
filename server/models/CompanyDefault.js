import mongoose from 'mongoose';

const companyDefaultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  hoursPerDay: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  includeWeekends: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const CompanyDefault = mongoose.model('CompanyDefault', companyDefaultSchema);

export default CompanyDefault;
