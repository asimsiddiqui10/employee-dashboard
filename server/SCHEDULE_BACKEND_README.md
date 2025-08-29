# Schedule and Job Code Backend Implementation

This document describes the robust backend implementation for the Schedule and Job Code functionality in the Employee Dashboard system.

## 🏗️ **Architecture Overview**

The backend consists of two main models with comprehensive APIs:

1. **Schedule Model** - Manages employee work schedules
2. **Job Code Model** - Manages job types and rates
3. **Controllers** - Business logic and API handlers
4. **Routes** - API endpoint definitions
5. **Middleware** - Authentication and authorization

## 📊 **Database Models**

### Schedule Model (`models/Schedule.js`)

**Key Features:**
- Weekly schedule structure (Monday-Sunday)
- Job code assignment for each day
- Hourly rates and total calculations
- Approval workflow (draft → active → archived)
- Conflict detection and validation
- Version tracking and audit trail

**Schema Fields:**
```javascript
{
  employee: ObjectId,           // Reference to Employee
  employeeId: String,           // Employee ID for quick lookup
  weekStartDate: Date,          // Week start (Monday)
  weekEndDate: Date,            // Week end (Sunday)
  schedules: [{                 // Daily schedule array
    date: Date,
    dayOfWeek: String,          // Monday, Tuesday, etc.
    enabled: Boolean,           // Day enabled/disabled
    startTime: String,          // "HH:MM" format
    endTime: String,            // "HH:MM" format
    hours: Number,              // Hours per day
    jobCode: String,            // Job code reference
    rate: Number,               // Hourly rate
    notes: String,              // Optional notes
    isWeekend: Boolean          // Auto-calculated
  }],
  totalWeeklyHours: Number,     // Auto-calculated
  totalWeeklyPay: Number,       // Auto-calculated
  status: String,               // draft, active, archived, cancelled
  approvalStatus: String,       // pending, approved, rejected
  version: Number               // Auto-incremented
}
```

**Advanced Features:**
- Automatic total calculations
- Schedule conflict detection
- Template-based schedule creation
- Copy week functionality
- Export capabilities (JSON/CSV)

### Job Code Model (`models/JobCode.js`)

**Key Features:**
- Hierarchical categorization
- Rate range validation
- Default job code management
- Skills and requirements tracking
- Department association

**Schema Fields:**
```javascript
{
  code: String,                 // Unique code (e.g., "ACT001")
  description: String,          // Human-readable description
  category: String,             // Labor, Equipment, Supervision, etc.
  defaultRate: Number,          // Default hourly rate
  minRate: Number,              // Minimum allowed rate
  maxRate: Number,              // Maximum allowed rate
  isActive: Boolean,            // Active/inactive status
  isDefault: Boolean,           // Default job code flag
  department: String,           // Associated department
  skills: [String],             // Required skills array
  requirements: String          // Job requirements
}
```

## 🚀 **API Endpoints**

### Schedule Routes (`/api/schedules`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all schedules with filtering | Admin only |
| GET | `/:id` | Get schedule by ID | Admin + Employee (own) |
| GET | `/employee/:employeeId` | Get employee schedules | Admin + Employee (own) |
| POST | `/` | Create new schedule | Admin only |
| PUT | `/:id` | Update schedule | Admin only |
| DELETE | `/:id` | Delete schedule | Admin only |
| PATCH | `/:id/approval` | Update approval status | Admin only |
| POST | `/:id/copy` | Copy schedule to next week | Admin only |
| GET | `/stats/overview` | Get schedule statistics | Admin only |
| PATCH | `/bulk` | Bulk update schedules | Admin only |
| GET | `/export/data` | Export schedules | Admin only |

### Job Code Routes (`/api/job-codes`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all job codes | Admin only |
| GET | `/:id` | Get job code by ID | Admin only |
| GET | `/default/get` | Get default job code | Public |
| GET | `/category/:category` | Get job codes by category | Public |
| GET | `/active/all` | Get all active job codes | Public |
| GET | `/search/query` | Search job codes | Public |
| POST | `/` | Create new job code | Admin only |
| PUT | `/:id` | Update job code | Admin only |
| DELETE | `/:id` | Delete job code | Admin only |
| PATCH | `/:id/toggle` | Toggle active status | Admin only |
| PATCH | `/:id/default` | Set as default | Admin only |
| PATCH | `/bulk` | Bulk update job codes | Admin only |
| GET | `/stats/overview` | Get job code statistics | Admin only |
| POST | `/import` | Import job codes | Admin only |

## 🔐 **Security & Authorization**

### Authentication
- JWT token-based authentication
- All routes require valid authentication token

### Authorization
- **Admin Routes**: Full CRUD access to schedules and job codes
- **Employee Routes**: Read-only access to own schedules
- **Public Routes**: Job code lookup for schedule creation

### Data Validation
- Input sanitization and validation
- Rate range validation
- Schedule conflict detection
- Job code existence validation

## 📈 **Performance Features**

### Database Optimization
- Compound indexes for efficient queries
- Pagination support for large datasets
- Aggregation pipelines for statistics
- Population of related data

### Caching Strategy
- Job codes cached for quick access
- Schedule data optimized for weekly views
- Efficient conflict detection queries

## 🛠️ **Setup Instructions**

### 1. Database Setup
```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/your/db
```

### 2. Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/employee-dashboard
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Default Job Codes
```bash
cd scripts
node seedJobCodes.js --run
```

### 5. Start Server
```bash
npm start
```

## 🔧 **Configuration Options**

### Schedule Settings
- **Week Start**: Monday (configurable)
- **Time Format**: 24-hour (HH:MM)
- **Hours Range**: 0-24 hours per day
- **Rate Validation**: Min/max rate constraints

### Job Code Settings
- **Categories**: Labor, Equipment, Supervision, Administrative, Sales, Technical, Other
- **Rate Constraints**: Min/max rate validation
- **Default Management**: Single default job code enforcement

## 📊 **Data Flow**

### Schedule Creation Flow
1. Admin selects employee
2. System loads employee details and job codes
3. Admin sets weekly schedule with job codes and rates
4. System validates data and checks for conflicts
5. Schedule saved as draft
6. Admin can approve or modify schedule

### Schedule Approval Flow
1. Draft schedule created
2. Admin reviews and approves
3. Schedule becomes active
4. Employee can view approved schedule
5. Schedule can be archived when no longer needed

## 🚨 **Error Handling**

### Validation Errors
- Rate range violations
- Schedule conflicts
- Invalid job codes
- Missing required fields

### Business Logic Errors
- Cannot delete active schedules
- Cannot modify archived schedules
- Approval workflow violations

### System Errors
- Database connection issues
- Authentication failures
- Authorization violations

## 🔄 **Integration Points**

### Frontend Integration
- Real-time job code fetching
- Schedule conflict notifications
- Approval workflow UI
- Export functionality

### External Systems
- Employee management system
- Payroll system integration
- Time tracking system
- Reporting and analytics

## 📝 **API Response Format**

### Success Response
```json
{
  "message": "Schedule created successfully",
  "schedule": {
    "_id": "schedule_id",
    "employeeId": "EMP001",
    "weekStartDate": "2024-01-01T00:00:00.000Z",
    "totalWeeklyHours": 40,
    "totalWeeklyPay": 1000,
    "status": "draft"
  }
}
```

### Error Response
```json
{
  "error": "Schedule conflict: Another schedule exists for this week",
  "conflictingSchedule": "conflict_id"
}
```

## 🧪 **Testing**

### Unit Tests
- Model validation tests
- Controller logic tests
- Route handler tests

### Integration Tests
- API endpoint tests
- Database operation tests
- Authentication flow tests

### Performance Tests
- Load testing for large datasets
- Database query optimization
- Response time benchmarks

## 🔮 **Future Enhancements**

### Planned Features
- Recurring schedule templates
- Advanced conflict resolution
- Mobile app support
- Real-time notifications
- Advanced reporting

### Scalability Improvements
- Redis caching layer
- Database sharding
- Microservices architecture
- API rate limiting

## 📞 **Support & Maintenance**

### Monitoring
- API response times
- Database performance
- Error rates and types
- User activity metrics

### Maintenance
- Regular database optimization
- Index maintenance
- Data archival policies
- Backup and recovery

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: Development Team 