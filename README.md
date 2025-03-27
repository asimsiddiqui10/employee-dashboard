










Employee Management Functionality Breakdown
1. Display an Employee List View
Data to Display:
Show a list of employees (fetched from the Employee model) with only 5–6 key details. For example:

Employee ID
Name
Department
Position
Email
Phone Number

View Details Button:
Each employee row/item should include a "View Details" button which will open a modal window, but shouldnt be functional right now.

2. Modal for Employee Details
Trigger:
When the "View Details" button is clicked, open a modal window.
Modal Contents:
The modal should display all the details of the selected employee (fetched from the Employee model). This includes all fields available in the schema (personal and work information).

Actions in the Modal:
Edit Employee Data:
Include an edit form within the modal that allows the admin to update employee details.
Delete Employee:
Provide a button to delete the employee.
Save/Cancel:
After editing, the admin should be able to save changes (which updates the database) or cancel the edit.


3. Integration with the Database
Fetch Data:
On initial load, fetch the employee list from the database using the Employee model.
Reflect Changes:
When an employee is edited through the modal, update the corresponding record in the database and refresh the Employee List view
When an employee is deleted, remove that employee from the database and update the list accordingly.

4. Additional Add Employee Button
Existing Functionality:
After the Employee List view, provide an "Add Employee" button (using the current code you have) to allow admin to add a new employee.
Separation of Concerns:
The EmployeeManagement.jsx file should now:
First, display the Employee List with the "View Details" functionality.
Then, include the "Add Employee" button for new entries.

Deliverables for the Cursor
Employee List Component:
Create a component (or update the existing EmployeeManagement.jsx) to fetch and display a list of employees.
Display only 5–6 key fields per employee.
For each employee, include a "View Details" button.
When employee logs in there should be a link in sidebar and respective component called My details in which detail of the employee must be visible.

Modal Component:

Create a modal that will display the full employee details when "View Details" is clicked.
Within the modal:
Display all fields from the Employee model.
Include an editable form for updating employee details.
Provide buttons for "Save Changes", "Delete Employee", and "Cancel".

Backend Integration:

Ensure that the modal’s actions (edit and delete) send requests to backend endpoints to update or remove the employee record.
After a successful update or deletion, refresh the Employee List on the frontend to reflect the changes.
Routing & State Management:
Use state management (such as React’s useState and useEffect hooks) to fetch data from the database and update the UI when changes occur.
Ensure that clicking "View Details" opens the modal with the correct employee’s information.
Add Employee Functionality:
Ensure that the "Add Employee" button remains below the Employee List and uses your existing code to add new employees.
Confirm that adding a new employee also creates the appropriate User record (if applicable) and updates the list view.




Sorting, pagination





2.Notification Functionality
Admin can send notifications to all employees or selected employees.
Employees can view notifications





3. Leave Functionality
Admin can approve or reject leave requests.
Admin can view all leave requests and their statuses.  

Employees can submit leave requests. 
Employees can view their leave requests and their statuses.
 





4.
Payroll Functionality
Admin can submit payroll documents for individual employees
Employees can view their payroll documents.



5.
Settings Functionality



6.
UI Shadcn
Theme Context
