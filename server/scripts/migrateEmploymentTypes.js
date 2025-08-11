import mongoose from 'mongoose';
import { config } from 'dotenv';
import Employee from '../models/Employee.js';

// Load environment variables
config();

const migrateEmploymentTypes = async () => {
  try {
    console.log('Starting employment type migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migration mapping
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

    let migratedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        const oldType = employee.employmentType;
        const newType = migrationMap[oldType] || 'Full-time/Part-time';
        
        await Employee.findByIdAndUpdate(employee._id, {
          employmentType: newType
        });

        console.log(`✓ Migrated ${employee.name} (${employee.employeeId}): ${oldType} → ${newType}`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${employee.name} (${employee.employeeId}):`, error.message);
        errorCount++;
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
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error setting default for ${employee.name} (${employee.employeeId}):`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Successfully migrated: ${migratedCount} employees`);
    console.log(`Errors: ${errorCount} employees`);
    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run migration
migrateEmploymentTypes(); 