import { format } from 'date-fns';

export const generateTimesheetCSV = (timeEntries) => {
  // Define headers
  const headers = [
    'Date',
    'Employee Name',
    'Employee ID',
    'Department',
    'Position',
    'Clock In',
    'Clock Out',
    'Total Work Time (min)',
    'Total Break Time (min)',
    'Week Total (min)',
    'Job Code',
    'Rate',
    'Shift',
    'Status',
    'Employee Approval',
    'Manager Approval',
    'Approval Date',
    'Approved By',
    'Notes'
  ].join(',');

  // Convert each timesheet to CSV row
  const rows = timeEntries.map(entry => {
    const values = [
      format(new Date(entry.date), 'yyyy-MM-dd'),
      entry.employee?.name || '',
      entry.employee?.employeeId || '',
      entry.employee?.department || '',
      entry.employee?.position || '',
      entry.clockIn ? format(new Date(entry.clockIn), 'HH:mm:ss') : '',
      entry.clockOut ? format(new Date(entry.clockOut), 'HH:mm:ss') : '',
      entry.totalWorkTime || 0,
      entry.totalBreakTime || 0,
      entry.weekTotal || 0,
      entry.jobCode || '',
      entry.rate ? entry.rate.toFixed(2) : '',
      entry.shift || '',
      entry.status || '',
      entry.employeeApproval ? 'Yes' : 'No',
      entry.managerApproval ? 'Yes' : 'No',
      entry.approvalDate ? format(new Date(entry.approvalDate), 'yyyy-MM-dd HH:mm:ss') : '',
      entry.approvedBy?.name || '',
      (entry.timesheetNotes || '').replace(/,/g, ';').replace(/\n/g, ' ') // Escape commas and newlines
    ];

    // Wrap values in quotes and join with commas
    return values.map(value => `"${value}"`).join(',');
  });

  // Combine headers and rows
  return [headers, ...rows].join('\n');
}; 