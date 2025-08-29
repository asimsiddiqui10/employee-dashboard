import mongoose from 'mongoose';
import { config } from 'dotenv';
import JobCode from '../models/JobCode.js';

// Load environment variables
config();

const defaultJobCodes = [
  {
    code: 'ACT001',
    title: 'General Labor',
    description: 'Basic labor and operational tasks',
    rate: 'NA',
    isDefault: true,
    isActive: true
  },
  {
    code: 'ACT002',
    title: 'Equipment Operator',
    description: 'Heavy machinery and equipment operation',
    rate: 'NA',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT003',
    title: 'Supervisor',
    description: 'Team leadership and operational oversight',
    rate: 'NA',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT004',
    title: 'Administrative Assistant',
    description: 'Office support and administrative tasks',
    rate: 'NA',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT005',
    title: 'Sales Representative',
    description: 'Customer relations and sales activities',
    rate: 'NA',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT006',
    title: 'Technician',
    description: 'Technical maintenance and repair work',
    rate: 'NA',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT007',
    title: 'Warehouse Worker',
    description: 'Inventory management and warehouse operations',
    rate: 'NA',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT008',
    title: 'Quality Control',
    description: 'Quality assurance and inspection activities',
    rate: 'NA',
    isDefault: false,
    isActive: true
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedJobCodes = async () => {
  try {
    console.log('Starting job codes seeding...');
    
    // Clear existing job codes
    await JobCode.deleteMany({});
    console.log('Cleared existing job codes');
    
    // Create new job codes
    const createdJobCodes = await JobCode.insertMany(defaultJobCodes);
    console.log(`Created ${createdJobCodes.length} job codes`);
    
    // Set the first one as default if none is marked as default
    const defaultJobCode = createdJobCodes.find(jc => jc.isDefault);
    if (!defaultJobCode) {
      createdJobCodes[0].isDefault = true;
      await createdJobCodes[0].save();
      console.log(`Set ${createdJobCodes[0].code} as default job code`);
    }
    
    console.log('Job codes seeding completed successfully!');
    console.log('Created job codes:');
    createdJobCodes.forEach(jc => {
      console.log(`- ${jc.code}: ${jc.title} (Rate: ${jc.rate})`);
    });
    
  } catch (error) {
    console.error('Error seeding job codes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(() => seedJobCodes());
}

export default seedJobCodes; 