import mongoose from 'mongoose';
import { config } from 'dotenv';
import Employee from '../models/Employee.js';
import TimeEntry from '../models/TimeEntry.js';

// Load environment variables
config();

const runAllMigrations = async () => {
  try {
    console.log('🚀 Starting all migrations...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Migration 1: Employment Types
    console.log('📋 Migration 1: Updating Employment Types');
    console.log('='.repeat(50));
    
    const migrationMap = {
      'Full-time': 'Full-time/Part-time',
      'Part-time': 'Full-time/Part-time',
      'Contract': 'Contract/Hourly',
      'Hourly': 'Contract/Hourly',
      'Consultant': 'Contract/Hourly'
    };

    // Find all employees with old employment types
    const employees = await Employee.find({
      employmentType: { $in: ['Full-time', 'Part-time', 'Contract', 'Hourly', 'Consultant'] }
    });

    console.log(`Found ${employees.length} employees to migrate`);

    let employeeMigratedCount = 0;
    let employeeErrorCount = 0;

    for (const employee of employees) {
      try {
        const oldType = employee.employmentType;
        const newType = migrationMap[oldType] || 'Full-time/Part-time';
        
        await Employee.findByIdAndUpdate(employee._id, {
          employmentType: newType
        });

        console.log(`✓ Migrated ${employee.name} (${employee.employeeId}): ${oldType} → ${newType}`);
        employeeMigratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${employee.name} (${employee.employeeId}):`, error.message);
        employeeErrorCount++;
      }
    }

    // Set default employment type for employees with null/undefined values
    const employeesWithoutType = await Employee.find({
      $or: [
        { employmentType: null },
        { employmentType: { $exists: false } }
      ]
    });

    console.log(`Found ${employeesWithoutType.length} employees without employment type`);

    for (const employee of employeesWithoutType) {
      try {
        await Employee.findByIdAndUpdate(employee._id, {
          employmentType: 'Full-time/Part-time'
        });
        
        console.log(`✓ Set default type for ${employee.name} (${employee.employeeId})`);
        employeeMigratedCount++;
      } catch (error) {
        console.error(`✗ Error setting default for ${employee.name} (${employee.employeeId}):`, error.message);
        employeeErrorCount++;
      }
    }

    console.log('\n📋 Migration 1 Summary:');
    console.log(`✅ Successfully migrated: ${employeeMigratedCount} employees`);
    console.log(`❌ Errors: ${employeeErrorCount} employees\n`);

    // Migration 2: Time Entry Job Codes
    console.log('🕐 Migration 2: Updating Time Entry Job Codes');
    console.log('='.repeat(50));

    // Find time entries without job codes (null, undefined, or empty)
    const timeEntriesWithoutJobCode = await TimeEntry.find({
      $or: [
        { jobCode: null },
        { jobCode: { $exists: false } },
        { jobCode: '' }
      ]
    }).populate('employee', 'name employeeId');

    console.log(`Found ${timeEntriesWithoutJobCode.length} time entries without job codes`);

    let timeEntryMigratedCount = 0;
    let timeEntryErrorCount = 0;

    for (const timeEntry of timeEntriesWithoutJobCode) {
      try {
        // Set default job code based on status
        let defaultJobCode = 'GENERAL';
        
        // If it's an active entry, we can leave it as null since it's not required yet
        if (timeEntry.status === 'active') {
          defaultJobCode = null;
        }

        await TimeEntry.findByIdAndUpdate(timeEntry._id, {
          jobCode: defaultJobCode
        });

        const employeeName = timeEntry.employee?.name || 'Unknown';
        const employeeId = timeEntry.employee?.employeeId || 'Unknown';
        
        console.log(`✓ Updated time entry for ${employeeName} (${employeeId}) - Status: ${timeEntry.status}, Job Code: ${defaultJobCode || 'null'}`);
        timeEntryMigratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating time entry ${timeEntry._id}:`, error.message);
        timeEntryErrorCount++;
      }
    }

    console.log('\n🕐 Migration 2 Summary:');
    console.log(`✅ Successfully migrated: ${timeEntryMigratedCount} time entries`);
    console.log(`❌ Errors: ${timeEntryErrorCount} time entries\n`);

    // Overall Summary
    console.log('🎉 ALL MIGRATIONS COMPLETED!');
    console.log('='.repeat(50));
    console.log('📊 Overall Summary:');
    console.log(`👥 Employees: ${employeeMigratedCount} migrated, ${employeeErrorCount} errors`);
    console.log(`🕐 Time Entries: ${timeEntryMigratedCount} migrated, ${timeEntryErrorCount} errors`);
    console.log('\n✅ Your database is now updated with:');
    console.log('   • Employment Types: "Full-time/Part-time" and "Contract/Hourly"');
    console.log('   • Default Job Codes: "GENERAL" for completed entries');
    console.log('   • Backward compatibility maintained');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    console.log('Migration process complete!');
    process.exit(0);
  }
};

// Run migration
runAllMigrations(); 