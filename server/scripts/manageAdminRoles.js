import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-dashboard';

// Helper function to add admin role to employees by various identifiers
async function addAdminRoleToEmployees(identifiers, identifierType = 'auto') {
  try {
    console.log('🔧 Adding admin role to employees...');
    console.log(`Identifiers: ${identifiers.join(', ')}`);
    console.log(`Type: ${identifierType}`);
    
    await mongoose.connect(MONGODB_URI);
    
    let employees = [];
    let users = [];

    // Determine how to find employees based on identifier type
    if (identifierType === 'email' || identifierType === 'auto') {
      // Try to find by email first (for users)
      const emailUsers = await User.find({ 
        email: { $in: identifiers } 
      }).populate('employee');
      
      users = emailUsers;
      console.log(`Found ${emailUsers.length} users by email`);
    }

    if (identifierType === 'employeeId' || identifierType === 'auto') {
      // Try to find by employee ID
      const employeesByIds = await Employee.find({ 
        employeeId: { $in: identifiers } 
      });
      
      employees = employeesByIds;
      console.log(`Found ${employeesByIds.length} employees by ID`);
      
      // Get corresponding users
      if (employeesByIds.length > 0) {
        const usersByEmployee = await User.find({
          employee: { $in: employeesByIds.map(emp => emp._id) }
        }).populate('employee');
        
        users = [...users, ...usersByEmployee];
      }
    }

    if (identifierType === 'name' || identifierType === 'auto') {
      // Try to find by name (both User and Employee)
      const usersByName = await User.find({ 
        name: { $in: identifiers } 
      }).populate('employee');
      
      const employeesByName = await Employee.find({ 
        name: { $in: identifiers } 
      });
      
      users = [...users, ...usersByName];
      employees = [...employees, ...employeesByName];
      
      console.log(`Found ${usersByName.length} users by name`);
      console.log(`Found ${employeesByName.length} employees by name`);
    }

    // Remove duplicates
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u._id.toString() === user._id.toString())
    );

    const uniqueEmployees = employees.filter((emp, index, self) => 
      index === self.findIndex(e => e._id.toString() === emp._id.toString())
    );

    console.log(`\n📊 Processing ${uniqueUsers.length} users and ${uniqueEmployees.length} employees`);

    let successCount = 0;
    let errorCount = 0;

    // Process Users
    for (const user of uniqueUsers) {
      try {
        if (!user.hasRole('admin')) {
          user.addRole('admin');
          await user.save();
          console.log(`✅ Added admin role to user: ${user.name} (${user.email})`);
          successCount++;
        } else {
          console.log(`ℹ️  User ${user.name} already has admin role`);
        }

        // Also update the associated employee if it exists
        if (user.employee) {
          const employee = user.employee;
          if (!employee.hasRole('admin')) {
            employee.addRole('admin');
            await employee.save();
            console.log(`✅ Added admin role to associated employee: ${employee.name} (${employee.employeeId})`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.name}:`, error.message);
        errorCount++;
      }
    }

    // Process standalone Employees (those without users found above)
    for (const employee of uniqueEmployees) {
      try {
        // Check if this employee is already processed via user
        const alreadyProcessed = uniqueUsers.some(user => 
          user.employee && user.employee._id.toString() === employee._id.toString()
        );

        if (!alreadyProcessed) {
          if (!employee.hasRole('admin')) {
            employee.addRole('admin');
            await employee.save();
            console.log(`✅ Added admin role to employee: ${employee.name} (${employee.employeeId})`);
            successCount++;
          } else {
            console.log(`ℹ️  Employee ${employee.name} already has admin role`);
          }

          // Try to find and update the associated user
          const associatedUser = await User.findOne({ employee: employee._id });
          if (associatedUser && !associatedUser.hasRole('admin')) {
            associatedUser.addRole('admin');
            await associatedUser.save();
            console.log(`✅ Added admin role to associated user: ${associatedUser.name} (${associatedUser.email})`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing employee ${employee.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Successfully processed: ${successCount} records`);
    console.log(`❌ Errors: ${errorCount} records`);

    // Show final statistics
    const adminUsers = await User.find({ roles: 'admin' }).countDocuments();
    const adminEmployees = await Employee.find({ roles: 'admin' }).countDocuments();
    
    console.log(`\n📊 Current Admin Counts:`);
    console.log(`Admin Users: ${adminUsers}`);
    console.log(`Admin Employees: ${adminEmployees}`);

  } catch (error) {
    console.error('❌ Error adding admin roles:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Function to remove admin role
async function removeAdminRoleFromEmployees(identifiers, identifierType = 'auto') {
  try {
    console.log('🔧 Removing admin role from employees...');
    
    await mongoose.connect(MONGODB_URI);
    
    // Similar logic as above but for removing roles
    // Implementation similar to addAdminRoleToEmployees but calling removeRole
    
    console.log('Remove functionality - implement similar to add but with removeRole');
    
  } catch (error) {
    console.error('❌ Error removing admin roles:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Function to list all admin users/employees
async function listAdminUsers() {
  try {
    console.log('📋 Listing all admin users and employees...');
    
    await mongoose.connect(MONGODB_URI);
    
    const adminUsers = await User.find({ roles: 'admin' }).populate('employee');
    const adminEmployees = await Employee.find({ roles: 'admin' });
    
    console.log('\n👑 Admin Users:');
    adminUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Roles: [${user.roles.join(', ')}]`);
      if (user.employee) {
        console.log(`  └─ Employee: ${user.employee.name} (${user.employee.employeeId}) - ${user.employee.department}`);
      }
    });

    console.log('\n👔 Admin Employees:');
    adminEmployees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.employeeId}) - ${emp.department} - Roles: [${emp.roles.join(', ')}]`);
    });

    console.log(`\n📊 Total: ${adminUsers.length} admin users, ${adminEmployees.length} admin employees`);

  } catch (error) {
    console.error('❌ Error listing admin users:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run based on command line arguments
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const command = process.argv[2];
  const type = process.argv[3];
  
  if (command === 'add') {
    // Usage: node manageAdminRoles.js add email user1@example.com user2@example.com
    // Usage: node manageAdminRoles.js add employeeId EMP001 EMP002
    // Usage: node manageAdminRoles.js add auto "John Doe" "jane@example.com" "EMP123"
    
    const identifiers = process.argv.slice(4);
    if (identifiers.length === 0) {
      console.error('❌ Please provide identifiers');
      console.log('Usage Examples:');
      console.log('  node manageAdminRoles.js add email user1@example.com user2@example.com');
      console.log('  node manageAdminRoles.js add employeeId EMP001 EMP002');
      console.log('  node manageAdminRoles.js add name "John Doe" "Jane Smith"');
      console.log('  node manageAdminRoles.js add auto user@example.com EMP123 "John Doe"');
      process.exit(1);
    }
    
    addAdminRoleToEmployees(identifiers, type || 'auto');
    
  } else if (command === 'remove') {
    const identifiers = process.argv.slice(4);
    if (identifiers.length === 0) {
      console.error('❌ Please provide identifiers');
      process.exit(1);
    }
    
    removeAdminRoleFromEmployees(identifiers, type || 'auto');
    
  } else if (command === 'list') {
    listAdminUsers();
    
  } else {
    console.log('📖 Usage:');
    console.log('  node manageAdminRoles.js add [type] [identifiers...]');
    console.log('  node manageAdminRoles.js remove [type] [identifiers...]');
    console.log('  node manageAdminRoles.js list');
    console.log('');
    console.log('Types: email, employeeId, name, auto');
    console.log('');
    console.log('Examples:');
    console.log('  node manageAdminRoles.js add email admin@company.com hr@company.com');
    console.log('  node manageAdminRoles.js add employeeId ENG379 PAR754');
    console.log('  node manageAdminRoles.js add name "Deepak Somarajan" "Julia Smith"');
    console.log('  node manageAdminRoles.js add auto user@example.com EMP123 "John Doe"');
    console.log('  node manageAdminRoles.js list');
  }
}

export { addAdminRoleToEmployees, removeAdminRoleFromEmployees, listAdminUsers }; 