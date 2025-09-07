import mongoose from 'mongoose';
import User from '../models/User.js';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-dashboard';

async function migrateUserRoles() {
  try {
    console.log('🚀 Starting User roles migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users that need migration (those without roles array)
    const usersToMigrate = await User.find({
      $or: [
        { roles: { $exists: false } },
        { roles: { $size: 0 } },
        { activeRole: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${usersToMigrate.length} users to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        console.log(`🔄 Migrating user: ${user.name} (${user.email})`);
        
        // Set roles array based on existing role field
        if (!user.roles || user.roles.length === 0) {
          user.roles = [user.role || 'employee'];
        }

        // Set activeRole based on existing role field
        if (!user.activeRole) {
          user.activeRole = user.role || 'employee';
        }

        // Ensure role field is set (backward compatibility)
        if (!user.role) {
          user.role = user.roles[0] || 'employee';
        }

        // Save the updated user
        await user.save();
        
        console.log(`✅ Migrated: ${user.name} - Roles: [${user.roles.join(', ')}], Active: ${user.activeRole}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating user ${user.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

    // Verify migration by checking updated records
    const verificationResults = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
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
      console.log(`Total Users: ${stats.totalUsers}`);
      console.log(`With Roles Array: ${stats.withRoles}`);
      console.log(`With Active Role: ${stats.withActiveRole}`);
      console.log(`Admin Roles: ${stats.adminRoles}`);
      console.log(`Employee Roles: ${stats.employeeRoles}`);
      console.log(`Multiple Roles: ${stats.multipleRoles}`);
    }

    console.log('\n🎉 User roles migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Helper function to add admin role to specific users
async function addAdminRoleToUsers(userEmails) {
  try {
    console.log('🔧 Adding admin role to specified users...');
    
    await mongoose.connect(MONGODB_URI);
    
    const users = await User.find({ 
      email: { $in: userEmails } 
    });

    console.log(`Found ${users.length} users to grant admin access`);

    for (const user of users) {
      if (!user.hasRole('admin')) {
        user.addRole('admin');
        await user.save();
        console.log(`✅ Added admin role to: ${user.name} (${user.email})`);
      } else {
        console.log(`ℹ️  ${user.name} already has admin role`);
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
    // Usage: node migrateUserRoles.js add-admin user1@example.com user2@example.com
    const userEmails = process.argv.slice(3);
    if (userEmails.length === 0) {
      console.error('❌ Please provide user emails to grant admin access');
      console.log('Usage: node migrateUserRoles.js add-admin user1@example.com user2@example.com');
      process.exit(1);
    }
    addAdminRoleToUsers(userEmails);
  } else {
    // Default migration
    migrateUserRoles();
  }
}

export { migrateUserRoles, addAdminRoleToUsers }; 