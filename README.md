
I want you to create a Employee Database Schema first.
User schema handles authentication, Employee schema handles employee information.They are linked through references. 

Admin should be able to add, edit, delete employees. when admin adds an employee, it should be with login credentials. 
Employee should be able to login to the system with that credentials.
When an admin adds a new employee, the system should create a corresponding User record with login credentials. The User document should include a reference to the Employee document for consistency between authentication and employee information.

In Admin Dashboard add a link in sidebar called "Employees". When clicked on that link, it should navigate to a page where admin can add, edit, delete employees.



Database Schema:

  employeeId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee', required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  picture: { type: String },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  ssn: { type: String, required: true, unique: true },
  nationality: { type: String },
  educationLevel: { type: String },
  certifications: [String],
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
  },
  
  // Work Information
  department: { type: String },
  position: { type: String },
  dateOfHire: { type: Date },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  employmentType: { type: String, enum: ['Part-time', 'Full-time', 'Contract', 'Consultant'] },
  employmentStatus: { type: String, enum: ['Active', 'On leave', 'Terminated'] },
  terminationDate: { type: Date },
  workEmail: { type: String },
  workPhoneNumber: { type: String },
  totalCompensation: { type: Number },



Admin can:
Add a new employee
Edit an employee
Delete an employee  




2.Notification Functionality
Admin can send notifications to all employees or selected employees.
Employees can view notifications





3. Leave Functionality
Admin can approve or reject leave requests.
Admin can view all leave requests and their statuses.  

Employees can submit leave requests. 
Employees can view their leave requests and their statuses.
 







Payroll Functionality
Admin can submit payroll documents for individual employees
Employees can view their payroll documents.




Settings Functionality




UI Shadcn
Theme Context
