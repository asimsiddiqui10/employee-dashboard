# Automatic Timesheet Feature

## Overview

The Automatic Timesheet feature allows Full-time/Part-time employees to schedule their work hours in advance, and the system automatically generates timesheets based on these schedules. Contract/Hourly employees continue to use the manual clock-in/out system.

## Features

### For Full-time/Part-time Employees
- **Schedule Work Hours**: Set specific dates, start times, and end times
- **Recurring Schedules**: Create daily, weekly, or monthly recurring schedules
- **Automatic Timesheet Generation**: System automatically creates timesheets based on scheduled hours
- **Manual Generation**: Manually generate timesheets for past dates if needed
- **Schedule Management**: Edit, delete, and view all scheduled work

### For Contract/Hourly Employees
- **Manual Clock-in/Out**: Continue using the existing time clock system
- **Real-time Tracking**: Track actual work hours with breaks

## How It Works

1. **Employee Schedules Work**: Full-time/Part-time employees create work schedules
2. **System Monitoring**: The system monitors scheduled work dates
3. **Automatic Generation**: When a scheduled date passes, the system can automatically generate timesheets
4. **Manual Override**: Employees can manually generate timesheets if needed

## API Endpoints

### Employee Routes
- `POST /api/scheduled-work` - Create new work schedule
- `GET /api/scheduled-work` - Get all scheduled work
- `GET /api/scheduled-work/today` - Get today's scheduled work
- `PUT /api/scheduled-work/:id` - Update scheduled work
- `DELETE /api/scheduled-work/:id` - Delete scheduled work
- `POST /api/scheduled-work/generate-timesheet` - Manually generate timesheet

### Admin Routes
- `POST /api/scheduled-work/bulk-generate` - Bulk generate timesheets for date range
- `POST /api/scheduled-work/admin/auto-generate-all` - Trigger automatic generation for all pending schedules
- `GET /api/scheduled-work/admin/all` - Get all scheduled work (admin only)

## Database Models

### ScheduledWork Model
```javascript
{
  employee: ObjectId,           // Reference to Employee
  date: Date,                   // Work date
  startTime: Date,              // Start time
  endTime: Date,                // End time
  status: String,               // 'scheduled', 'completed', 'cancelled'
  timesheetGenerated: Boolean,  // Whether timesheet was generated
  timesheetId: ObjectId,        // Reference to generated TimeEntry
  notes: String,                // Optional notes
  recurring: {                  // Recurring schedule options
    enabled: Boolean,
    pattern: String,            // 'daily', 'weekly', 'monthly'
    daysOfWeek: [Number],       // For weekly patterns (0-6)
    endDate: Date              // Optional end date
  }
}
```

## Frontend Components

### AutomaticTimesheet.jsx
Main component that combines the form and list views for scheduling work hours.

### ScheduledWorkForm.jsx
Form component for creating and editing work schedules with recurring options.

### ScheduledWorkList.jsx
Component to display and manage existing scheduled work entries.

### AutomaticTimesheetAdmin.jsx
Admin component for managing all scheduled work and automatic timesheets across the organization.

## Automatic Generation

### Manual Trigger
Admins can manually trigger automatic timesheet generation using the admin endpoint.

### Scheduled Jobs (Recommended)
Set up a cron job or scheduled task to run automatic generation daily:

```javascript
// Example cron job (runs daily at 1 AM)
0 1 * * * curl -X POST http://your-api/api/scheduled-work/admin/auto-generate-all
```

### Node-cron Implementation
You can also implement scheduled jobs using node-cron:

```javascript
import cron from 'node-cron';
import { generateAutomaticTimesheets } from './utils/autoTimesheetGenerator.js';

// Run daily at 1 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Running scheduled automatic timesheet generation...');
  try {
    const results = await generateAutomaticTimesheets();
    console.log('Scheduled generation completed:', results);
  } catch (error) {
    console.error('Scheduled generation failed:', error);
  }
});
```

## Configuration

### Employment Type Detection
The system automatically detects employee type from the `employmentType` field:
- `'Full-time/Part-time'` → Shows Automatic Timesheet interface
- `'Contract/Hourly'` → Shows Manual Time Clock interface

### Default Values
- **Job Code**: `'AUTO001'` for automatic timesheets
- **Rate**: Uses employee's hourly rate if available, otherwise 0
- **Notes**: Prefixed with "Auto-generated from scheduled work:"

## Security

- All routes are protected by authentication middleware
- Employees can only access their own scheduled work
- Admin routes require admin role
- Validation prevents scheduling conflicts and invalid times

## Error Handling

- Duplicate schedules for the same date are prevented
- Invalid time ranges (start >= end) are rejected
- Past dates are allowed for historical scheduling
- Timesheet generation checks for existing entries

## Future Enhancements

- **Email Notifications**: Notify employees when timesheets are generated
- **Approval Workflow**: Manager approval for automatic timesheets
- **Integration**: Connect with payroll and HR systems
- **Analytics**: Dashboard for scheduled vs actual hours
- **Mobile App**: Mobile interface for schedule management

## Troubleshooting

### Common Issues

1. **Timesheet Not Generated**
   - Check if schedule date has passed
   - Verify schedule status is 'scheduled'
   - Check for existing timesheets on the same date

2. **Schedule Conflicts**
   - Only one schedule allowed per date per employee
   - Delete conflicting schedule before creating new one

3. **Recurring Schedule Issues**
   - Weekly schedules require at least one day selected
   - End dates must be in the future

### Debug Logs
Enable debug logging in development to see detailed information about automatic generation process.

## Support

For technical support or questions about the Automatic Timesheet feature, please contact your system administrator or refer to the API documentation. 