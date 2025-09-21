import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PayrollCalendar from '../models/PayrollCalendar.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Find an admin user to use as createdBy
async function findAdminUser() {
  try {
    // First, try to find any admin user
    let adminUser = await User.findOne({ 
      $or: [
        { role: 'admin' },
        { roles: { $in: ['admin'] } }
      ]
    });

    if (adminUser) {
      console.log(`👤 Found admin user: ${adminUser.email}`);
      return adminUser._id;
    }

    // If no admin found, create a system user for this purpose
    console.log('👤 No admin user found, creating system user...');
    const systemUser = new User({
      email: 'system@payroll.calendar',
      password: 'system-generated', // This won't be used for login
      role: 'admin',
      roles: ['admin'],
      activeRole: 'admin'
    });

    await systemUser.save();
    console.log('✅ Created system user for payroll calendar management');
    return systemUser._id;

  } catch (error) {
    console.error('❌ Error finding/creating admin user:', error);
    throw error;
  }
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Helper function to get month name
function getMonthName(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()];
}

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function populatePayrollCalendar() {
  try {
    console.log('🗓️  Starting Payroll Calendar Population...\n');

    // Get admin user for createdBy field
    const adminUserId = await findAdminUser();

    // Clear existing calendar entries for 2025 (optional)
    const deleteResult = await PayrollCalendar.deleteMany({
      payPeriodStart: { $gte: new Date('2025-01-01') }
    });
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing 2025 entries\n`);

    // Start date: July 1, 2025 (Tuesday)
    let currentStart = new Date('2025-07-01');
    const endDate = new Date('2025-12-31');
    
    const payrollPeriods = [];
    let periodNumber = 1;

    while (currentStart <= endDate) {
      // Calculate period end (13 days after start, so 14-day period total)
      const periodEnd = addDays(currentStart, 13);
      
      // Pay date is typically 3-5 days after period ends (using 5 days)
      const payDate = addDays(periodEnd, 5);
      
      // Create title based on period
      const startMonth = getMonthName(currentStart);
      const endMonth = getMonthName(periodEnd);
      const year = currentStart.getFullYear();
      
      let title;
      if (startMonth === endMonth) {
        title = `${startMonth} ${year} - Period ${periodNumber}`;
      } else {
        title = `${startMonth}/${endMonth} ${year} - Period ${periodNumber}`;
      }

      // Determine status based on current date
      const now = new Date();
      let status;
      if (payDate < now) {
        status = 'completed';
      } else if (currentStart <= now && now <= periodEnd) {
        status = 'current';
      } else {
        status = 'upcoming';
      }

      const payrollPeriod = {
        title,
        payPeriodStart: currentStart,
        payPeriodEnd: periodEnd,
        payDate,
        status,
        notes: `Bi-weekly payroll period ${periodNumber} for ${year}`,
        createdBy: adminUserId
      };

      payrollPeriods.push(payrollPeriod);
      
      console.log(`📅 Period ${periodNumber}: ${formatDate(currentStart)} to ${formatDate(periodEnd)} (Pay: ${formatDate(payDate)})`);
      
      // Move to next period (14 days later)
      currentStart = addDays(currentStart, 14);
      periodNumber++;
    }

    // Insert all periods into database
    console.log(`\n💾 Inserting ${payrollPeriods.length} payroll periods...`);
    const insertResult = await PayrollCalendar.insertMany(payrollPeriods);
    
    console.log(`\n✅ Successfully created ${insertResult.length} payroll calendar entries!`);
    
    // Display summary
    console.log('\n📊 SUMMARY:');
    console.log(`📅 Period Range: July 1, 2025 - December 31, 2025`);
    console.log(`🔄 Frequency: Every 14 days (bi-weekly)`);
    console.log(`📈 Total Periods: ${insertResult.length}`);
    console.log(`💰 Pay Dates: 5 days after each period ends`);
    
    // Show first few and last few entries
    console.log('\n📋 FIRST 3 PERIODS:');
    payrollPeriods.slice(0, 3).forEach((period, index) => {
      console.log(`   ${index + 1}. ${period.title}`);
      console.log(`      Period: ${formatDate(period.payPeriodStart)} - ${formatDate(period.payPeriodEnd)}`);
      console.log(`      Pay Date: ${formatDate(period.payDate)}`);
      console.log(`      Status: ${period.status}`);
      console.log('');
    });

    console.log('📋 LAST 3 PERIODS:');
    payrollPeriods.slice(-3).forEach((period, index) => {
      const actualIndex = payrollPeriods.length - 3 + index + 1;
      console.log(`   ${actualIndex}. ${period.title}`);
      console.log(`      Period: ${formatDate(period.payPeriodStart)} - ${formatDate(period.payPeriodEnd)}`);
      console.log(`      Pay Date: ${formatDate(period.payDate)}`);
      console.log(`      Status: ${period.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error populating payroll calendar:', error);
  }
}

async function main() {
  await connectDB();
  await populatePayrollCalendar();
  
  console.log('🎉 Payroll Calendar Population Complete!');
  console.log('👀 Check your admin dashboard to see the new calendar entries.');
  
  await mongoose.connection.close();
  console.log('📴 Database connection closed.');
  process.exit(0);
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 