// controllers/employeeController.js
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { uploadFile } from '../config/supabase.js';

// Add a new employee or admin
export const addEmployee = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Request received to add employee:', req.body);
    console.log('User making request:', req.user);
    
    const { employeeId, role, name, email, password, ssn, manager, workPhoneNumber, compensationType, compensationValue, active, isAdmin, ...rest } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields',
        missing: {
          email: !email,
          password: !password,
          name: !name,
          role: !role
        }
      });
    }

    // Check if user making request is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create new users' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if employeeId already exists
    if (!isAdmin) {
      const existingEmployee = await Employee.findOne({ employeeId }).session(session);
      if (existingEmployee) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    // Create user first
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'employee',
      profileImage: 'https://via.placeholder.com/150'
    });
    await newUser.save({ session });

    // If creating an employee (not admin), create employee record
    if (!isAdmin) {
      const employeeData = {
        employeeId,
        name,
        email,
        role,
        ssn,
        workPhoneNumber,
        compensationType,
        compensationValue,
        user: newUser._id, // Link to user
        ...rest
      };

      if (manager && mongoose.Types.ObjectId.isValid(manager)) {
        employeeData.supervisor = manager;
      }

      const employee = new Employee(employeeData);
      await employee.save({ session });

      // Link employee to user
      newUser.employee = employee._id;
      await newUser.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({ 
        success: true,
        message: 'Employee created successfully',
        employee,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }

    // If creating admin, just commit the user creation
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ 
      success: true,
      message: 'Admin created successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Only abort if transaction is active
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } catch (transactionError) {
      console.error('Error aborting transaction:', transactionError);
    }
    
    session.endSession();

    // Send appropriate error message based on error type
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    // Validation or other errors
    const errorMessage = error.errors 
      ? Object.values(error.errors).map(err => err.message).join(', ')
      : error.message || 'Failed to create user';
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage
    });
  }
};

// Edit employee
export const editEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { email, role, password, workPhoneNumber, compensationType, compensationValue, active, supervisor, ...rest } = req.body;

    console.log('Edit request received:', { employeeId, supervisor }); // Debug log

    // Validate compensation if being updated
    if (compensationType || compensationValue) {
      if (!(compensationType && compensationValue)) {
        return res.status(400).json({
          success: false,
          error: 'Both compensation type and value must be provided together'
        });
      }
    }

    // Validate supervisor if provided
    if (supervisor) {
      if (!mongoose.Types.ObjectId.isValid(supervisor)) {
        console.log('Invalid supervisor ID:', supervisor); // Debug log
        return res.status(400).json({ message: 'Invalid supervisor ID' });
      }

      // Check if supervisor exists and is not the same as the employee
      const supervisorExists = await Employee.findById(supervisor);
      if (!supervisorExists) {
        return res.status(400).json({ message: 'Supervisor not found' });
      }
      if (supervisorExists.employeeId === employeeId) {
        return res.status(400).json({ message: 'Employee cannot be their own supervisor' });
      }
    }

    // Update employee fields
    const updateData = {
      email,
      role,
      workPhoneNumber,
      compensationType,
      compensationValue,
      active,
      supervisor: supervisor || null,
      ...rest
    };

    console.log('Updating employee with data:', updateData); // Debug log

    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      updateData,
      { new: true }
    ).populate('supervisor', 'name employeeId');

    // Update user if necessary
    if (updatedEmployee) {
      const userToUpdate = await User.findOne({ employee: updatedEmployee._id });
      if (userToUpdate) {
        userToUpdate.email = email;
        userToUpdate.role = role;
        if (password) {
          userToUpdate.password = await bcrypt.hash(password, 10);
        }
        await userToUpdate.save();
      }

      console.log('Employee updated successfully:', updatedEmployee); // Debug log
      return res.status(200).json({ message: 'Employee updated', employee: updatedEmployee });
    } else {
      return res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: 'Failed to update employee' });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId } = req.params;
    
    // Find employee first
    const employee = await Employee.findOne({ employeeId }).session(session);
    if (!employee) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Find and delete user associated with this employee
    const user = await User.findById(employee.user).session(session);
    if (user) {
      await User.findByIdAndDelete(user._id).session(session);
    }

    // Delete the employee
    await Employee.findByIdAndDelete(employee._id).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ 
      success: true, 
      message: 'Employee deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ 
      success: false, 
      message: 'Error deleting employee',
      error: error.message 
    });
  }
};

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate({
        path: 'user',
        select: '_id name email role'
      })
      .populate({
        path: 'supervisor',
        select: 'name employeeId'
      });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee by ID
export const getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId })
      .populate({
        path: 'user',
        select: '_id name email role'
      })
      .populate({
        path: 'supervisor',
        select: 'name employeeId'
      });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee counts by department
export const getEmployeeCountsByDepartment = async (req, res) => {
  try {
    const departmentCounts = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get total count
    const totalEmployees = await Employee.countDocuments();

    res.json({
      success: true,
      data: {
        departments: departmentCounts,
        total: totalEmployees
      }
    });
  } catch (error) {
    console.error('Error fetching employee counts by department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my details
export const getMyDetails = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .populate('supervisor', 'name employeeId');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employees by department
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    if (!department) {
      return res.status(400).json({ 
        success: false,
        message: 'Department parameter is required' 
      });
    }

    const employees = await Employee.find({ 
      department: department,
      employmentStatus: 'Active' // Only show active employees
    })
    .populate('user', 'name email')
    .select('name employeeId position profilePic department employmentType')
    .sort({ name: 1 });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Add this new controller function
export const uploadProfilePic = async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      employeeId: req.params.employeeId,
      headers: req.headers
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { employeeId } = req.params;
    
    // Validate employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      console.log('Employee not found:', employeeId);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${employeeId}/${timestamp}-${req.file.originalname}`;

    console.log('Attempting to upload file to Supabase:', {
      bucket: 'profile-pics',
      filename,
      fileSize: req.file.size,
      mimetype: req.file.mimetype
    });

    // Upload to Supabase
    const { publicUrl } = await uploadFile(
      'profile-pics',
      filename,
      req.file.buffer,
      {
        contentType: req.file.mimetype
      }
    );

    console.log('File uploaded successfully to Supabase:', publicUrl);

    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      { profilePic: publicUrl },
      { new: true }
    );

    if (!updatedEmployee) {
      console.log('Failed to update employee record:', employeeId);
      return res.status(500).json({ message: 'Failed to update employee record' });
    }

    console.log('Employee updated successfully:', updatedEmployee.employeeId);

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePic: publicUrl
    });
  } catch (error) {
    console.error('Error in uploadProfilePic:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error uploading profile picture';
    
    if (error.message.includes('bucket')) {
      errorMessage = 'Storage bucket not found. Please check Supabase configuration.';
    } else if (error.message.includes('permission')) {
      errorMessage = 'Permission denied. Please check Supabase credentials.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
};

// Change employee password
export const changeEmployeePassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Try to find employee by MongoDB _id first, then by employeeId string
    let employee;
    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      employee = await Employee.findById(employeeId);
    }
    
    if (!employee) {
      employee = await Employee.findOne({ employeeId });
    }

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find associated user
    const user = await User.findOne({ employee: employee._id });
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Check if admin is making the change (skip current password verification for admins)
    const isAdmin = req.user.role === 'admin' || (req.user.roles && req.user.roles.includes('admin'));
    
    // If not admin, verify current password
    if (!isAdmin) {
      const { currentPassword } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required for non-admin users' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unique departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Employee.distinct('department');
    res.json(departments.filter(dept => dept)); // Filter out null/empty values
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching departments' 
    });
  }
};