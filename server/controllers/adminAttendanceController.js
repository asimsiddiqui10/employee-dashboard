import PunchEntry from '../models/PunchEntry.js';
import Employee from '../models/Employee.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Get attendance data for different time ranges
export const getAttendanceData = async (req, res) => {
  try {
    const { timeRange } = req.params; // today, week, month
    const today = new Date();
    
    let startDate, endDate;
    
    switch (timeRange) {
      case 'today':
        startDate = startOfDay(today);
        endDate = endOfDay(today);
        break;
      case 'week':
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      default:
        startDate = startOfDay(today);
        endDate = endOfDay(today);
    }

    // Get all Full-time and Part-time employees
    const totalEmployees = await Employee.countDocuments({
      employmentType: { $in: ['Full-time', 'Part-time'] },
      employmentStatus: 'Active'
    });

    // Get punch entries for the specified time range
    const punchEntries = await PunchEntry.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('employee', 'name employeeId profilePic department position employmentType');

    // Filter for Full-time and Part-time employees and remove duplicates
    const filteredEntries = punchEntries.filter(punch => 
      punch.employee && 
      (punch.employee.employmentType === 'Full-time' || punch.employee.employmentType === 'Part-time')
    );

    console.log('Filtered entries before deduplication:', filteredEntries.length);
    console.log('Sample entries:', filteredEntries.slice(0, 3).map(e => ({
      employeeName: e.employee.name,
      employeeId: e.employee._id,
      date: e.date,
      punchIn: e.punchIn
    })));

    // Group by employee and date to remove duplicates (keep latest entry per employee per day)
    // Handle cases where same person has multiple employee records (due to email changes)
    const uniqueEntries = [];
    const employeeDateMap = new Map();
    const employeeNameDateMap = new Map(); // Primary deduplication by name

    filteredEntries.forEach(entry => {
      // Use employee name and date for primary deduplication (handles multiple employee records for same person)
      const employeeName = entry.employee.name;
      const employeeId = entry.employee._id.toString();
      const dateKey = entry.date.toDateString();
      const nameKey = `${employeeName}-${dateKey}`; // Primary key using name
      const idKey = `${employeeId}-${dateKey}`; // Secondary key using ID
      
      console.log('Processing entry:', {
        employeeName: entry.employee.name,
        employeeId: employeeId,
        dateKey: dateKey,
        nameKey: nameKey,
        idKey: idKey,
        punchIn: entry.punchIn
      });
      
      // Use name-based deduplication as primary (handles multiple employee records for same person)
      if (!employeeNameDateMap.has(nameKey) || entry.punchIn > employeeNameDateMap.get(nameKey).punchIn) {
        employeeNameDateMap.set(nameKey, entry);
        employeeDateMap.set(idKey, entry); // Also track by ID for reference
        console.log('Added/Updated entry for name key:', nameKey);
      } else {
        console.log('Skipped duplicate entry for name key:', nameKey);
      }
    });

    // Convert map values back to array and sort by employee name for consistent display
    // Use employeeNameDateMap as primary source to avoid duplicates from multiple employee records
    const deduplicatedEntries = Array.from(employeeNameDateMap.values()).sort((a, b) => {
      return a.employee.name.localeCompare(b.employee.name);
    });

    console.log('Deduplicated entries:', deduplicatedEntries.length);
    console.log('Final entries:', deduplicatedEntries.map(e => ({
      employeeName: e.employee.name,
      employeeId: e.employee._id,
      date: e.date
    })));

    // Calculate statistics
    const presentEmployees = deduplicatedEntries.length;
    const absentEmployees = totalEmployees - presentEmployees;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 0;

    // Get department-wise statistics
    const departmentStats = await Employee.aggregate([
      {
        $match: {
          employmentType: { $in: ['Full-time', 'Part-time'] },
          employmentStatus: 'Active'
        }
      },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 }
        }
      }
    ]);

    // Get present employees by department
    const presentByDepartment = await PunchEntry.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $unwind: '$employeeData'
      },
      {
        $match: {
          'employeeData.employmentType': { $in: ['Full-time', 'Part-time'] }
        }
      },
      {
        $group: {
          _id: '$employeeData.department',
          present: { $sum: 1 }
        }
      }
    ]);

    // Combine department stats
    const combinedDepartmentStats = departmentStats.map(dept => {
      const presentDept = presentByDepartment.find(p => p._id === dept._id);
      return {
        department: dept._id,
        total: dept.total,
        present: presentDept ? presentDept.present : 0,
        absent: dept.total - (presentDept ? presentDept.present : 0)
      };
    });

    res.json({
      success: true,
      data: deduplicatedEntries,
      stats: {
        totalEmployees,
        presentToday: presentEmployees,
        absentToday: absentEmployees,
        attendanceRate
      },
      departmentStats: combinedDepartmentStats
    });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance data',
      error: error.message
    });
  }
};