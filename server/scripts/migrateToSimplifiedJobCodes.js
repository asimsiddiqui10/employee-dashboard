import mongoose from 'mongoose';
import { config } from 'dotenv';
import JobCode from '../models/JobCode.js';

// Load environment variables
config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateToSimplifiedJobCodes = async () => {
  try {
    console.log('Starting migration to simplified job codes...');
    
    // Find all existing job codes
    const existingJobCodes = await JobCode.find({});
    console.log(`Found ${existingJobCodes.length} existing job codes`);
    
    for (const jobCode of existingJobCodes) {
      console.log(`Migrating job code: ${jobCode.code}`);
      
      // Remove old fields that are no longer needed
      const updateData = {
        $unset: {
          department: 1,
          category: 1,
          skills: 1,
          requirements: 1,
          createdBy: 1,
          lastModifiedBy: 1,
          version: 1
        }
      };
      
      // Update the document
      await JobCode.updateOne({ _id: jobCode._id }, updateData);
      console.log(`  - Removed old fields from ${jobCode.code}`);
    }
    
    console.log('Migration to simplified job codes completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the migration
migrateToSimplifiedJobCodes(); 