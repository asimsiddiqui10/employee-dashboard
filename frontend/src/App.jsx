import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PrivateRoutes from './utils/PrivateRoutes'
import RoleBasedRoutes from './utils/RoleBasedRoutes'
import AdminHome from './components/admin/AdminHome'
import EmployeeManagement from './components/admin/EmployeeManagement'
import Unauthorized from './pages/Unauthorized'
import EmployeeHome from './components/employee/EmployeeHome'
import MyDetails from './components/employee/MyDetails'
import UnderProgress from './components/common/UnderProgress'
import AdminNotifications from './components/admin/AdminNotifications'
import EmployeeNotifications from './components/employee/EmployeeNotifications'
import EmployeeDetails from './components/admin/EmployeeDetails'
import LeaveManagement from './components/admin/LeaveManagement'
import LeaveRequest from './components/employee/LeaveRequest'
import DocumentUpload from './components/admin/DocumentUpload'
import MyDocuments from './components/employee/MyDocuments'
import { ThemeProvider } from './context/themeContext'
import PayrollUpload from './components/admin/PayrollUpload'
import PayrollDocuments from './components/employee/PayrollDocuments'
import { useAuth } from './context/authContext'
import Departments from './components/admin/Departments'
import DepartmentDetails from './components/admin/DepartmentDetails'
import TimeTrackingWrapper from './components/employee/TimeTrackingWrapper'
import AdminTimeTracking from './components/admin/AdminTimeTracking'
import MyTeam from './components/employee/MyTeam'
import Requests from './components/employee/Requests';
import RequestManagement from './components/admin/RequestManagement';
import Reimbursements from './components/employee/Reimbursements';
import ReimbursementManagement from './components/admin/ReimbursementManagement';
import JobCodes from './components/admin/JobCodes';
import Timeclock from './pages/Timeclock';
import TimeclockLogin from './pages/TimeclockLogin';
import ScheduleManagement from './components/admin/ScheduleManagement';
import EmployeeSchedule from './components/employee/EmployeeSchedule';


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

function App() {
  const { user, loading } = useAuth();
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/timeclock-login" element={<TimeclockLogin />}></Route>
            
            {/* Kiosk Timeclock - Admin only, outside dashboard layout */}
            <Route path="/timeclock" element={
              <PrivateRoutes>
                <RoleBasedRoutes requiredRole={['admin']}>
                  <Timeclock />
                </RoleBasedRoutes>
              </PrivateRoutes>
            } />
            
            <Route path="/admin-dashboard" element={
              <PrivateRoutes>
                <RoleBasedRoutes requiredRole={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoutes>
              </PrivateRoutes>
            }>
              <Route index element={<AdminHome/>}></Route>
              <Route path="employees" element={<EmployeeManagement/>}></Route>
              <Route path="employees/:employeeId" element={<EmployeeDetails/>}></Route>
              <Route path="notifications" element={<AdminNotifications/>}></Route>
              <Route path="payroll" element={<PayrollUpload />} />
              <Route path="time-tracking" element={<AdminTimeTracking />} />
              <Route path="schedules" element={<ScheduleManagement />} />
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="attendance" element={<UnderProgress/>}></Route>
              <Route path="teams" element={<UnderProgress/>}></Route>
              <Route path="meetings" element={<UnderProgress/>}></Route>
              <Route path="requests" element={<RequestManagement />} />
              <Route path="reimbursements" element={<ReimbursementManagement />} />
              <Route path="tasks" element={<UnderProgress/>}></Route>

              <Route path="documents" element={<DocumentUpload />} />
              <Route path="training" element={<UnderProgress/>}></Route>
              <Route path="benefits" element={<UnderProgress/>}></Route>
              <Route path="feedback" element={<UnderProgress/>}></Route>
              <Route path="settings" element={<UnderProgress/>}></Route>
              <Route path="departments" element={<Departments />} />
              <Route path="departments/:departmentId" element={<DepartmentDetails />} />
              <Route path="job-codes" element={<JobCodes />} />
            </Route>

            <Route path="/employee-dashboard" element={
              <PrivateRoutes>
                <RoleBasedRoutes requiredRole={['employee', 'admin']}>
                  <EmployeeDashboard />
                </RoleBasedRoutes>
              </PrivateRoutes>
            }>
              <Route index element={<EmployeeHome />} />
              <Route path="notifications" element={<EmployeeNotifications />} />
              <Route path="my-details" element={<MyDetails />} />
              <Route path="payroll" element={<PayrollDocuments />} />
              <Route path="time-tracking" element={<TimeTrackingWrapper />} />
              <Route path="leave" element={<LeaveRequest />} />
              <Route path="schedule" element={<EmployeeSchedule />} />
              <Route path="meetings" element={<UnderProgress />} />
              <Route path="requests" element={<Requests />} />
              <Route path="tasks" element={<UnderProgress />} />
              <Route path="reimbursements" element={<Reimbursements />} />
              <Route path="documents" element={<MyDocuments />} />
              <Route path="team" element={<MyTeam />} />
              <Route path="training" element={<UnderProgress />} />
              <Route path="benefits" element={<UnderProgress />} />
              <Route path="reports" element={<UnderProgress />} />
              <Route path="feedback" element={<UnderProgress />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
