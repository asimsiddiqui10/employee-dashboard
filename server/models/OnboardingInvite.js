import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const onboardingInviteSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID()
  },
  email: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OnboardingInvite = mongoose.model('OnboardingInvite', onboardingInviteSchema);
export default OnboardingInvite;
