import mongoose from 'mongoose';
import { config } from 'dotenv';
import TimeEntry from '../models/TimeEntry.js';

// Load environment variables
config();

const migrateTimeEntryJobCodes = async () => {
  try {
    console.log('Starting time entry job code migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find time entries without job codes (null, undefined, or empty)
    const timeEntriesWithoutJobCode = await TimeEntry.find({
      $or: [
        { jobCode: null },
        { jobCode: { $exists: false } },
        { jobCode: '' }
      ]
    }).populate('employee', 'name employeeId');

    console.log(`Found ${timeEntriesWithoutJobCode.length} time entries without job codes`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const timeEntry of timeEntriesWithoutJobCode) {
      try {
        // Set default job code based on status
        let defaultJobCode = 'ACT001';
        
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
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating time entry ${timeEntry._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Successfully migrated: ${migratedCount} time entries`);
    console.log(`Errors: ${errorCount} time entries`);
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
migrateTimeEntryJobCodes(); 