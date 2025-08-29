import mongoose from 'mongoose';
import { config } from 'dotenv';
import CompanyDefault from '../models/CompanyDefault.js';

// Load environment variables
config();

const companyDefaults = [
  {
    name: 'Standard 9-5',
    description: 'Standard Monday to Friday 9 AM to 5 PM schedule with 1-hour lunch break',
    schedule: {
      monday: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        hours: 8.0,
        breaks: [
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          }
        ]
      },
      tuesday: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        hours: 8.0,
        breaks: [
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          }
        ]
      },
      wednesday: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        hours: 8.0,
        breaks: [
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          }
        ]
      },
      thursday: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        hours: 8.0,
        breaks: [
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          }
        ]
      },
      friday: {
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        hours: 8.0,
        breaks: [
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          }
        ]
      },
      saturday: {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
        hours: 0,
        breaks: []
      },
      sunday: {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
        hours: 0,
        breaks: []
      }
    },
    defaultJobCode: 'ACT001',
    defaultRate: 25.00,
    isDefault: true
  },
  {
    name: 'Flexible 8-6',
    description: 'Flexible Monday to Friday 8 AM to 6 PM schedule with 2 short breaks',
    schedule: {
      monday: {
        enabled: true,
        startTime: '08:00',
        endTime: '18:00',
        hours: 10.0,
        breaks: [
          {
            startTime: '10:00',
            endTime: '10:15',
            duration: 15,
            description: 'Morning Break'
          },
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          },
          {
            startTime: '15:00',
            endTime: '15:15',
            duration: 15,
            description: 'Afternoon Break'
          }
        ]
      },
      tuesday: {
        enabled: true,
        startTime: '08:00',
        endTime: '18:00',
        hours: 10.0,
        breaks: [
          {
            startTime: '10:00',
            endTime: '10:15',
            duration: 15,
            description: 'Morning Break'
          },
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          },
          {
            startTime: '15:00',
            endTime: '15:15',
            duration: 15,
            description: 'Afternoon Break'
          }
        ]
      },
      wednesday: {
        enabled: true,
        startTime: '08:00',
        endTime: '18:00',
        hours: 10.0,
        breaks: [
          {
            startTime: '10:00',
            endTime: '10:15',
            duration: 15,
            description: 'Morning Break'
          },
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          },
          {
            startTime: '15:00',
            endTime: '15:15',
            duration: 15,
            description: 'Afternoon Break'
          }
        ]
      },
      thursday: {
        enabled: true,
        startTime: '08:00',
        endTime: '18:00',
        hours: 10.0,
        breaks: [
          {
            startTime: '10:00',
            endTime: '10:15',
            duration: 15,
            description: 'Morning Break'
          },
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          },
          {
            startTime: '15:00',
            endTime: '15:15',
            duration: 15,
            description: 'Afternoon Break'
          }
        ]
      },
      friday: {
        enabled: true,
        startTime: '08:00',
        endTime: '18:00',
        hours: 10.0,
        breaks: [
          {
            startTime: '10:00',
            endTime: '10:15',
            duration: 15,
            description: 'Morning Break'
          },
          {
            startTime: '12:00',
            endTime: '13:00',
            duration: 60,
            description: 'Lunch Break'
          },
          {
            startTime: '15:00',
            endTime: '15:15',
            duration: 15,
            description: 'Afternoon Break'
          }
        ]
      },
      saturday: {
        enabled: false,
        startTime: '08:00',
        endTime: '18:00',
        hours: 0,
        breaks: []
      },
      sunday: {
        enabled: false,
        startTime: '08:00',
        endTime: '18:00',
        hours: 0,
        breaks: []
      }
    },
    defaultJobCode: 'ACT001',
    defaultRate: 30.00,
    isDefault: false
  }
];

const seedCompanyDefaults = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing company defaults
    await CompanyDefault.deleteMany({});
    console.log('Cleared existing company defaults');

    // Insert new company defaults
    const createdDefaults = await CompanyDefault.insertMany(companyDefaults);
    console.log(`Created ${createdDefaults.length} company defaults`);

    // Set the first one as default
    if (createdDefaults.length > 0) {
      await CompanyDefault.findByIdAndUpdate(createdDefaults[0]._id, { isDefault: true });
      console.log('Set Standard 9-5 as default company schedule');
    }

    console.log('Company defaults seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding company defaults:', error);
    process.exit(1);
  }
};

seedCompanyDefaults(); 