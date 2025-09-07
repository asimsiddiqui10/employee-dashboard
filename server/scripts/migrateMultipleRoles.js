import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-dashboard';

async function migrateMultipleRoles() {
  try {
    console.log('🚀 Starting multiple roles migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all employees that need migration (those without roles array)
    const employeesToMigrate = await Employee.find({
      $or: [
        { roles: { $exists: false } },
        { roles: { $size: 0 } },
        { activeRole: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${employeesToMigrate.length} employees to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const employee of employeesToMigrate) {
      try {
        console.log(`🔄 Migrating employee: ${employee.name} (${employee.employeeId})`);
        
        // Set roles array based on existing role field
        if (!employee.roles || employee.roles.length === 0) {
          employee.roles = [employee.role || 'employee'];
        }

        // Set activeRole based on existing role field
        if (!employee.activeRole) {
          employee.activeRole = employee.role || 'employee';
        }

        // Ensure role field is set (backward compatibility)
        if (!employee.role) {
          employee.role = employee.roles[0] || 'employee';
        }

        // Save the updated employee
        await employee.save();
        
        console.log(`✅ Migrated: ${employee.name} - Roles: [${employee.roles.join(', ')}], Active: ${employee.activeRole}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating employee ${employee.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} employees`);
    console.log(`❌ Errors: ${errorCount} employees`);

    // Verify migration by checking updated records
    const verificationResults = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          withRoles: { $sum: { $cond: [{ $isArray: "$roles" }, 1, 0] } },
          withActiveRole: { $sum: { $cond: [{ $ne: ["$activeRole", null] }, 1, 0] } },
          adminRoles: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $isArray: "$roles" },
                    { $in: ["admin", "$roles"] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          },
          employeeRoles: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $isArray: "$roles" },
                    { $in: ["employee", "$roles"] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          },
          multipleRoles: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $isArray: "$roles" },
                    { $gt: [{ $size: "$roles" }, 1] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);

    if (verificationResults.length > 0) {
      const stats = verificationResults[0];
      console.log('\n📊 Post-Migration Statistics:');
      console.log(`Total Employees: ${stats.totalEmployees}`);
      console.log(`With Roles Array: ${stats.withRoles}`);
      console.log(`With Active Role: ${stats.withActiveRole}`);
      console.log(`Admin Roles: ${stats.adminRoles}`);
      console.log(`Employee Roles: ${stats.employeeRoles}`);
      console.log(`Multiple Roles: ${stats.multipleRoles}`);
    }

    console.log('\n🎉 Multiple roles migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Helper function to add admin role to specific employees
async function addAdminRoleToEmployees(employeeIds) {
  try {
    console.log('🔧 Adding admin role to specified employees...');
    
    await mongoose.connect(MONGODB_URI);
    
    const employees = await Employee.find({ 
      employeeId: { $in: employeeIds } 
    });

    console.log(`Found ${employees.length} employees to grant admin access`);

    for (const employee of employees) {
      if (!employee.hasRole('admin')) {
        employee.addRole('admin');
        await employee.save();
        console.log(`✅ Added admin role to: ${employee.name} (${employee.employeeId})`);
      } else {
        console.log(`ℹ️  ${employee.name} already has admin role`);
      }
    }

  } catch (error) {
    console.error('❌ Error adding admin roles:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run migration if this script is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const command = process.argv[2];
  
  if (command === 'add-admin') {
    // Usage: node migrateMultipleRoles.js add-admin EMP001 EMP002
    const employeeIds = process.argv.slice(3);
    if (employeeIds.length === 0) {
      console.error('❌ Please provide employee IDs to grant admin access');
      console.log('Usage: node migrateMultipleRoles.js add-admin EMP001 EMP002');
      process.exit(1);
    }
    addAdminRoleToEmployees(employeeIds);
  } else {
    // Default migration
    migrateMultipleRoles();
  }
}

export { migrateMultipleRoles, addAdminRoleToEmployees }; 