// controllers/employeeController.js
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Add a new employee
export const addEmployee = async (req, res) => {
  try {
    console.log('Request received to add employee:', req.body);
    console.log('User making request:', req.user);
    
    const { employeeId, role, name, email, password, ssn, manager, ...rest } = req.body;

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

    // 1. Create the Employee record
    const newEmployee = new Employee({
      employeeId,
      role,
      name,
      email,
      ssn,
      manager: manager || undefined,
      ...rest,
    });
    const savedEmployee = await newEmployee.save();

    // 2. Create the User record for authentication
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role, 
      employee: savedEmployee._id,
    });
    await newUser.save();

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
    const { email, role, password, ...rest } = req.body;

    // Update employee fields
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      { email, role, ...rest },
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
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
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
    const employees = await Employee.find();
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
