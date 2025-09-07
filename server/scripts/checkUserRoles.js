import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-dashboard';

async function checkUserRoles(identifier) {
  try {
    console.log(`🔍 Checking roles for: ${identifier}`);
    
    await mongoose.connect(MONGODB_URI);
    
    // Try to find user by email
    let user = await User.findOne({ email: identifier }).populate('employee');
    
    if (!user) {
      // Try to find by name
      user = await User.findOne({ name: identifier }).populate('employee');
    }
    
    if (!user) {
      // Try to find by employee ID
      const employee = await Employee.findOne({ employeeId: identifier });
      if (employee) {
        user = await User.findOne({ employee: employee._id }).populate('employee');
      }
    }
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n👤 User Information:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Legacy Role: ${user.role}`);
    console.log(`Roles Array: [${user.roles ? user.roles.join(', ') : 'none'}]`);
    console.log(`Active Role: ${user.activeRole}`);
    
    if (user.employee) {
      console.log('\n👔 Employee Information:');
      console.log(`Name: ${user.employee.name}`);
      console.log(`Employee ID: ${user.employee.employeeId}`);
      console.log(`Department: ${user.employee.department}`);
      console.log(`Legacy Role: ${user.employee.role}`);
      console.log(`Roles Array: [${user.employee.roles ? user.employee.roles.join(', ') : 'none'}]`);
      console.log(`Active Role: ${user.employee.activeRole}`);
    }
    
    console.log('\n🔄 Role Switch Capability:');
    const userRoles = user.roles || (user.role ? [user.role] : []);
    console.log(`Can Switch Roles: ${userRoles.length > 1 ? 'YES' : 'NO'}`);
    console.log(`Available Roles: [${userRoles.join(', ')}]`);
    
    // Test the hasRole method
    if (user.hasRole) {
      console.log(`Has Admin Role: ${user.hasRole('admin')}`);
      console.log(`Has Employee Role: ${user.hasRole('employee')}`);
    } else {
      console.log('⚠️  hasRole method not available');
    }
    
  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const identifier = process.argv[2];
  
  if (!identifier) {
    console.error('❌ Please provide a user identifier (email, name, or employee ID)');
    console.log('Usage: node checkUserRoles.js <email|name|employeeId>');
    console.log('Example: node checkUserRoles.js ENG379');
    console.log('Example: node checkUserRoles.js asimsiddiqui.you@gmail.com');
    process.exit(1);
  }
  
  checkUserRoles(identifier);
}

export { checkUserRoles }; 