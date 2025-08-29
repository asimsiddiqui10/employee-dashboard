import mongoose from 'mongoose';
import JobCode from '../models/JobCode.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default job codes data
const defaultJobCodes = [
  {
    code: 'ACT001',
    description: 'General Labor',
    category: 'Labor',
    defaultRate: 25.00,
    minRate: 20.00,
    maxRate: 35.00,
    department: 'Operations',
    skills: ['Manual labor', 'Equipment operation', 'Safety protocols'],
    requirements: 'Basic safety training, physical fitness',
    isDefault: true,
    isActive: true
  },
  {
    code: 'ACT002',
    description: 'Equipment Operator',
    category: 'Equipment',
    defaultRate: 35.00,
    minRate: 30.00,
    maxRate: 45.00,
    department: 'Operations',
    skills: ['Heavy equipment operation', 'Safety protocols', 'Maintenance'],
    requirements: 'Equipment certification, safety training, experience',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT003',
    description: 'Supervisor',
    category: 'Supervision',
    defaultRate: 45.00,
    minRate: 40.00,
    maxRate: 60.00,
    department: 'Management',
    skills: ['Leadership', 'Project management', 'Team coordination'],
    requirements: 'Management experience, leadership skills',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT004',
    description: 'Administrative Assistant',
    category: 'Administrative',
    defaultRate: 30.00,
    minRate: 25.00,
    maxRate: 40.00,
    department: 'Administration',
    skills: ['Office software', 'Communication', 'Organization'],
    requirements: 'Office experience, computer skills',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT005',
    description: 'Sales Representative',
    category: 'Sales',
    defaultRate: 40.00,
    minRate: 35.00,
    maxRate: 55.00,
    department: 'Sales',
    skills: ['Sales techniques', 'Customer service', 'Communication'],
    requirements: 'Sales experience, communication skills',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT006',
    description: 'Technician',
    category: 'Technical',
    defaultRate: 40.00,
    minRate: 35.00,
    maxRate: 50.00,
    department: 'Technical',
    skills: ['Technical expertise', 'Problem solving', 'Maintenance'],
    requirements: 'Technical certification, experience',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT007',
    description: 'Quality Control',
    category: 'Technical',
    defaultRate: 35.00,
    minRate: 30.00,
    maxRate: 45.00,
    department: 'Quality Assurance',
    skills: ['Quality standards', 'Inspection techniques', 'Documentation'],
    requirements: 'Quality training, attention to detail',
    isDefault: false,
    isActive: true
  },
  {
    code: 'ACT008',
    description: 'Warehouse Worker',
    category: 'Labor',
    defaultRate: 28.00,
    minRate: 23.00,
    maxRate: 38.00,
    department: 'Warehouse',
    skills: ['Inventory management', 'Forklift operation', 'Organization'],
    requirements: 'Forklift certification, physical fitness',
    isDefault: false,
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Seed job codes
const seedJobCodes = async () => {
  try {
    console.log('Starting job codes seeding...');

    // Clear existing job codes
    await JobCode.deleteMany({});
    console.log('Cleared existing job codes');

    // Insert default job codes
    const createdJobCodes = await JobCode.insertMany(defaultJobCodes);
    console.log(`Created ${createdJobCodes.length} job codes`);

    // Display created job codes
    console.log('\nCreated Job Codes:');
    createdJobCodes.forEach(jobCode => {
      console.log(`- ${jobCode.code}: ${jobCode.description} ($${jobCode.defaultRate}/hr)`);
    });

    console.log('\nJob codes seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding job codes:', error);
    process.exit(1);
  }
};

// Run the seeding
if (process.argv.includes('--run')) {
  connectDB().then(() => {
    seedJobCodes();
  });
} else {
  console.log('To run this script, use: node seedJobCodes.js --run');
  process.exit(0);
} 