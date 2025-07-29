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
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="teams" element={<UnderProgress/>}></Route>
              <Route path="announcements" element={<UnderProgress/>}></Route>
              <Route path="requests" element={<UnderProgress/>}></Route>
              <Route path="tasks" element={<UnderProgress/>}></Route>
              <Route path="expenses" element={<UnderProgress/>}></Route>
              <Route path="documents" element={<DocumentUpload />} />
              <Route path="training" element={<UnderProgress/>}></Route>
              <Route path="benefits" element={<UnderProgress/>}></Route>
              <Route path="insights" element={<UnderProgress/>}></Route>
              <Route path="feedback" element={<UnderProgress/>}></Route>
              <Route path="settings" element={<UnderProgress/>}></Route>
              <Route path="departments" element={<Departments />} />
              <Route path="departments/:departmentId" element={<DepartmentDetails />} />
            </Route>

            <Route path="/employee-dashboard" element={
              <PrivateRoutes>
                <RoleBasedRoutes requiredRole={['employee']}>
                  <EmployeeDashboard />
                </RoleBasedRoutes>
              </PrivateRoutes>
            }>
              <Route index element={<EmployeeHome />} />
              <Route path="my-details" element={<MyDetails />} />
              <Route path="notifications" element={<EmployeeNotifications />} />
              <Route path="payroll" element={<PayrollDocuments />} />
              <Route path="time-tracking" element={<TimeTrackingWrapper />} />
              <Route path="leave" element={<LeaveRequest />} />
              <Route path="announcements" element={<UnderProgress />} />
              <Route path="requests" element={<UnderProgress />} />
              <Route path="tasks" element={<UnderProgress />} />
              <Route path="reimbursements" element={<UnderProgress />} />
              <Route path="documents" element={<MyDocuments />} />
              <Route path="team" element={<UnderProgress />} />
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
