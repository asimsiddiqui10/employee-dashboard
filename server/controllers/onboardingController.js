import OnboardingInvite from '../models/OnboardingInvite.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { uploadFile } from '../config/supabase.js';

// POST /api/onboarding/invite — Admin creates a new invite token
export const createInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const invite = new OnboardingInvite({
      email: email || null,
      createdBy: req.user._id
    });
    await invite.save();

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${baseUrl}/onboard/${invite.token}`;

    return res.status(201).json({
      success: true,
      invite: {
        _id: invite._id,
        token: invite.token,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        link
      }
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return res.status(500).json({ success: false, message: 'Failed to create invite' });
  }
};

// GET /api/onboarding/invites — Admin lists all invites
export const getInvites = async (req, res) => {
  try {
    const invites = await OnboardingInvite.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name employeeId');

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const result = invites.map(inv => ({
      _id: inv._id,
      token: inv.token,
      email: inv.email,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      createdBy: inv.createdBy,
      completedBy: inv.completedBy,
      link: `${baseUrl}/onboard/${inv.token}`
    }));

    return res.json({ success: true, invites: result });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch invites' });
  }
};

// GET /api/onboarding/verify/:token — Public: verify token
export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await OnboardingInvite.findOne({ token });

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invalid invite link' });
    }

    if (invite.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This invite has already been used' });
    }

    if (invite.status === 'expired' || invite.expiresAt < new Date()) {
      if (invite.status !== 'expired') {
        invite.status = 'expired';
        await invite.save();
      }
      return res.status(400).json({ success: false, message: 'This invite link has expired' });
    }

    return res.json({
      success: true,
      email: invite.email || null,
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/onboarding/complete/:token — Public: create user + employee
export const completeOnboarding = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { token } = req.params;
    const invite = await OnboardingInvite.findOne({ token }).session(session);

    if (!invite) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Invalid invite link' });
    }

    if (invite.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invite is no longer valid' });
    }

    if (invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save({ session });
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invite link has expired' });
    }

    const {
      name, email, password,
      gender, maritalStatus, phoneNumber, dateOfBirth,
      address, city, state, zipCode, nationality, educationLevel, certifications,
      department, position, jobTitle, employmentType, compensationType, compensationValue, dateOfHire,
      ssn,
      emergencyContactName, emergencyContactPhone,
      profilePic
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !gender || !ssn || !department || !employmentType || !compensationType) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing: {
          name: !name, email: !email, password: !password,
          gender: !gender, ssn: !ssn, department: !department,
          employmentType: !employmentType, compensationType: !compensationType
        }
      });
    }

    // Check email uniqueness
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Auto-generate employeeId: EMP-YYYY-NNNN
    const year = new Date().getFullYear();
    const last = await Employee.findOne({ employeeId: /^EMP-/ })
      .sort({ employeeId: -1 })
      .select('employeeId')
      .session(session);
    const seq = last ? parseInt(last.employeeId.split('-')[2]) + 1 : 1;
    const employeeId = `EMP-${year}-${String(seq).padStart(4, '0')}`;

    // Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'employee',
      profileImage: profilePic || 'https://via.placeholder.com/150'
    });
    await newUser.save({ session });

    // Build employee data
    const employeeData = {
      employeeId,
      name,
      email,
      role: 'employee',
      gender,
      ssn,
      department,
      employmentType,
      compensationType,
      user: newUser._id
    };

    if (maritalStatus) employeeData.maritalStatus = maritalStatus;
    if (phoneNumber) employeeData.phoneNumber = phoneNumber;
    if (dateOfBirth) employeeData.dateOfBirth = dateOfBirth;
    if (address) employeeData.address = address;
    if (city) employeeData.city = city;
    if (state) employeeData.state = state;
    if (zipCode) employeeData.zipCode = zipCode;
    if (nationality) employeeData.nationality = nationality;
    if (educationLevel) employeeData.educationLevel = educationLevel;
    if (certifications) {
      employeeData.certifications = typeof certifications === 'string'
        ? certifications.split(',').map(c => c.trim()).filter(Boolean)
        : certifications;
    }
    if (position) employeeData.position = position;
    if (jobTitle) employeeData.jobTitle = jobTitle;
    if (compensationValue) employeeData.compensationValue = Number(compensationValue);
    if (dateOfHire) employeeData.dateOfHire = dateOfHire;
    if (profilePic) employeeData.profilePic = profilePic;
    if (emergencyContactName || emergencyContactPhone) {
      employeeData.emergencyContact = {
        name: emergencyContactName || '',
        phone: emergencyContactPhone || ''
      };
    }

    const employee = new Employee(employeeData);
    await employee.save({ session });

    // Link employee to user
    newUser.employee = employee._id;
    await newUser.save({ session });

    // Mark invite as completed
    invite.status = 'completed';
    invite.completedBy = employee._id;
    await invite.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Onboarding complete',
      employeeId,
      name
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (e) {
      console.error('Error aborting transaction:', e);
    }
    session.endSession();

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    const errorMessage = error.errors
      ? Object.values(error.errors).map(e => e.message).join(', ')
      : error.message || 'Failed to complete onboarding';

    return res.status(400).json({ success: false, message: errorMessage });
  }
};

// POST /api/onboarding/upload/:token — Public: upload a document
export const uploadOnboardingDocument = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await OnboardingInvite.findOne({ token });

    if (!invite || invite.status === 'expired' || invite.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invite' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const filename = `onboarding/${token}/${timestamp}-${req.file.originalname}`;

    const { publicUrl } = await uploadFile(
      'documents',
      filename,
      req.file.buffer,
      { contentType: req.file.mimetype }
    );

    return res.status(200).json({
      success: true,
      fileUrl: publicUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading onboarding document:', error);
    return res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
};
