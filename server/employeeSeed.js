import mongoose from 'mongoose';
import Employee from './models/Employee.js';
import connectToDatabase from './db/db.js';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure dotenv with the correct path
config({ path: join(__dirname, '.env') });

const seedEmployees = async () => {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    const employees = [
      {
        employeeId: 'E001',
        role: 'employee',
        name: 'Alice Johnson',
        gender: 'Female',
        email: 'alice.johnson@example.com',
        phoneNumber: '123-456-7890',
        department: 'Engineering',
        position: 'Software Engineer',
        ssn: '123-45-6789',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Main St, Anytown, USA',
        nationality: 'American',
        educationLevel: 'Bachelor',
        certifications: ['Certified Java Developer'],
        emergencyContact: { name: 'Bob Johnson', phone: '987-654-3210' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2020-01-15'),
        workEmail: 'alice.johnson@company.com',
        workPhoneNumber: '123-456-7890',
        totalCompensation: 90000,
      },
      // Add 9 more employee objects here
      {
        employeeId: 'E002',
        role: 'employee',
        name: 'Bob Smith',
        gender: 'Male',
        email: 'bob.smith@example.com',
        phoneNumber: '234-567-8901',
        department: 'Marketing',
        position: 'Marketing Specialist',
        ssn: '234-56-7890',
        dateOfBirth: new Date('1985-05-15'),
        address: '456 Elm St, Othertown, USA',
        nationality: 'American',
        educationLevel: 'Master',
        certifications: ['Certified Marketing Professional'],
        emergencyContact: { name: 'Alice Smith', phone: '876-543-2109' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2019-03-10'),
        workEmail: 'bob.smith@company.com',
        workPhoneNumber: '234-567-8901',
        totalCompensation: 75000,
      },
      {
        employeeId: 'E003',
        role: 'employee',
        name: 'Carol Williams',
        gender: 'Female',
        email: 'carol.williams@example.com',
        phoneNumber: '345-678-9012',
        department: 'Finance',
        position: 'Financial Analyst',
        ssn: '345-67-8901',
        dateOfBirth: new Date('1988-09-22'),
        address: '789 Oak St, Somewhere, USA',
        nationality: 'American',
        educationLevel: 'Master',
        certifications: ['CFA Level 2', 'Financial Planning Certificate'],
        emergencyContact: { name: 'David Williams', phone: '765-432-1098' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2018-07-05'),
        workEmail: 'carol.williams@company.com',
        workPhoneNumber: '345-678-9012',
        totalCompensation: 85000,
      },
      {
        employeeId: 'E004',
        role: 'employee',
        name: 'David Brown',
        gender: 'Male',
        email: 'david.brown@example.com',
        phoneNumber: '456-789-0123',
        department: 'Human Resources',
        position: 'HR Manager',
        ssn: '456-78-9012',
        dateOfBirth: new Date('1982-03-17'),
        address: '101 Pine St, Elsewhere, USA',
        nationality: 'American',
        educationLevel: 'Bachelor',
        certifications: ['SHRM-CP', 'HR Management'],
        emergencyContact: { name: 'Emily Brown', phone: '654-321-0987' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2017-11-20'),
        workEmail: 'david.brown@company.com',
        workPhoneNumber: '456-789-0123',
        totalCompensation: 92000,
      },
      {
        employeeId: 'E005',
        role: 'employee',
        name: 'Emily Davis',
        gender: 'Female',
        email: 'emily.davis@example.com',
        phoneNumber: '567-890-1234',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        ssn: '567-89-0123',
        dateOfBirth: new Date('1986-12-05'),
        address: '202 Maple St, Anyplace, USA',
        nationality: 'Canadian',
        educationLevel: 'PhD',
        certifications: ['AWS Certified Developer', 'Scrum Master'],
        emergencyContact: { name: 'Frank Davis', phone: '543-210-9876' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2016-04-15'),
        workEmail: 'emily.davis@company.com',
        workPhoneNumber: '567-890-1234',
        totalCompensation: 110000,
      },
      {
        employeeId: 'E006',
        role: 'employee',
        name: 'Frank Miller',
        gender: 'Male',
        email: 'frank.miller@example.com',
        phoneNumber: '678-901-2345',
        department: 'Sales',
        position: 'Sales Representative',
        ssn: '678-90-1234',
        dateOfBirth: new Date('1992-07-30'),
        address: '303 Birch St, Somewhere Else, USA',
        nationality: 'American',
        educationLevel: 'Bachelor',
        certifications: ['Sales Certification'],
        emergencyContact: { name: 'Grace Miller', phone: '432-109-8765' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2021-02-10'),
        workEmail: 'frank.miller@company.com',
        workPhoneNumber: '678-901-2345',
        totalCompensation: 65000,
      },
      {
        employeeId: 'E007',
        role: 'employee',
        name: 'Grace Wilson',
        gender: 'Female',
        email: 'grace.wilson@example.com',
        phoneNumber: '789-012-3456',
        department: 'Product',
        position: 'Product Manager',
        ssn: '789-01-2345',
        dateOfBirth: new Date('1984-11-12'),
        address: '404 Cedar St, Nowhere, USA',
        nationality: 'American',
        educationLevel: 'Master',
        certifications: ['Product Management Professional', 'Agile Certified'],
        emergencyContact: { name: 'Henry Wilson', phone: '321-098-7654' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2018-09-01'),
        workEmail: 'grace.wilson@company.com',
        workPhoneNumber: '789-012-3456',
        totalCompensation: 95000,
      },
      {
        employeeId: 'E008',
        role: 'employee',
        name: 'Henry Taylor',
        gender: 'Male',
        email: 'henry.taylor@example.com',
        phoneNumber: '890-123-4567',
        department: 'IT Support',
        position: 'IT Specialist',
        ssn: '890-12-3456',
        dateOfBirth: new Date('1991-04-25'),
        address: '505 Walnut St, Somewhere New, USA',
        nationality: 'British',
        educationLevel: 'Bachelor',
        certifications: ['CompTIA A+', 'Microsoft Certified'],
        emergencyContact: { name: 'Isabel Taylor', phone: '210-987-6543' },
        employmentType: 'Full-time',
        employmentStatus: 'Active',
        dateOfHire: new Date('2019-10-15'),
        workEmail: 'henry.taylor@company.com',
        workPhoneNumber: '890-123-4567',
        totalCompensation: 72000,
      },
    ];

    for (const employee of employees) {
      const existingEmployee = await Employee.findOne({ employeeId: employee.employeeId });
      if (!existingEmployee) {
        await Employee.create(employee);
        console.log(`Employee ${employee.name} added successfully`);
      } else {
        console.log(`Employee ${employee.name} already exists`);
      }
    }

    console.log('Employee seeding completed');
  } catch (error) {
    console.error('Error seeding employees:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedEmployees();