// controllers/employeeController.js
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { uploadFile } from '../config/supabase.js';

// Add a new employee
export const addEmployee = async (req, res) => {
  try {
    console.log('Request received to add employee:', req.body);
    console.log('User making request:', req.user);
    
    const { employeeId, role, name, email, password, ssn, manager, workPhoneNumber, compensationType, compensationValue, active, ...rest } = req.body;

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

    // Validate manager field
    if (manager && !mongoose.Types.ObjectId.isValid(manager)) {
      return res.status(400).json({ message: 'Invalid manager ID' });
    }

    // Check if employeeId or ssn already exists
    const existingEmployee = await Employee.findOne({ $or: [{ employeeId }, { ssn }] });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID or SSN already exists' });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Validate compensation
    if (!compensationType || !compensationValue) {
      return res.status(400).json({ 
        success: false, 
        error: 'Compensation type and value are required' 
      });
    }

    // 1. Create the User record first
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    const savedUser = await newUser.save();

    // 2. Now create the Employee record with the user reference
    const newEmployee = new Employee({
      employeeId,
      role,
      name,
      email,
      ssn,
      manager: manager || undefined,
      user: savedUser._id,
      workPhoneNumber,
      compensationType,
      compensationValue,
      active: active !== undefined ? active : true,
      ...rest,
    });
    const savedEmployee = await newEmployee.save();

    // 3. Update the User with the employee reference
    savedUser.employee = savedEmployee._id;
    await savedUser.save();

    return res.status(201).json({ message: 'Employee created successfully', employee: savedEmployee });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ message: 'Duplicate key error', error: error.message });
    }
    console.error('Detailed error in addEmployee:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(400).json({ 
      message: 'Error adding employee', 
      error: error.message 
    });
  }
};

// Edit employee
export const editEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { email, role, password, workPhoneNumber, compensationType, compensationValue, active, ...rest } = req.body;

    // Validate compensation if being updated
    if (compensationType || compensationValue) {
      if (!(compensationType && compensationValue)) {
        return res.status(400).json({
          success: false,
          error: 'Both compensation type and value must be provided together'
        });
      }
    }

    // Update employee fields
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      { email, role, workPhoneNumber, compensationType, compensationValue, active, ...rest },
      { new: true }
    );

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
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOneAndDelete({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Remove user associated with this employee
    await User.findOneAndDelete({ employee: employee._id });

    return res.status(200).json({ message: 'Employee deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate({
        path: 'user',
        select: '_id name email role' // Include all needed fields
      });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this to your existing employeeController.js
export const getMyDetails = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

// Add this new controller function
export const uploadProfilePic = async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file,
      employeeId: req.params.employeeId
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { employeeId } = req.params;
    
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${employeeId}/${timestamp}-${req.file.originalname}`;

    // Upload to Supabase
    const { publicUrl } = await uploadFile(
      'profile-pics',
      filename,
      req.file.buffer,
      {
        contentType: req.file.mimetype
      }
    );

    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      { profilePic: publicUrl },
      { new: true }
    );

    if (!updatedEmployee) {
      console.log('Employee not found:', employeeId);
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log('Employee updated successfully:', updatedEmployee);

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePic: publicUrl
    });
  } catch (error) {
    console.error('Error in uploadProfilePic:', error);
    res.status(500).json({ 
      message: 'Error uploading profile picture',
      error: error.message 
    });
  }
};