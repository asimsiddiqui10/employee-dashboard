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
import DocumentUpload from './components/admin/DocumentUpload';
import Documents from './components/employee/Documents';
import { ThemeProvider } from './context/themeContext';
import { PayrollDocuments } from './components/employee/documents/PayrollDocuments';
import { PersonalDocuments } from './components/employee/documents/PersonalDocuments';
import { CompanyDocuments } from './components/employee/documents/CompanyDocuments';
import { OnboardingDocuments } from './components/employee/documents/OnboardingDocuments';
import { BenefitsDocuments } from './components/employee/documents/BenefitsDocuments';
import { TrainingDocuments } from './components/employee/documents/TrainingDocuments';


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
              <Route path="analytics" element={<UnderProgress/>}></Route>
              <Route path="projects" element={<UnderProgress/>}></Route>
              <Route path="payroll" element={<UnderProgress/>}></Route>
              <Route path="reports" element={<UnderProgress/>}></Route>
              <Route path="training" element={<UnderProgress/>}></Route>
              <Route path="documents" element={<DocumentUpload />} />
              <Route path="settings" element={<UnderProgress/>}></Route>
              <Route path="departments" element={<UnderProgress/>}></Route>
              <Route path="leave" element={<LeaveManagement />} />
              <Route path="help" element={<UnderProgress/>}></Route>
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
              <Route path="leave" element={<LeaveRequest />} />
              <Route path="documents" element={<Documents />} />
              
              {/* Document section routes */}
              <Route path="documents/payroll" element={<PayrollDocuments />} />
              <Route path="documents/personal" element={<PersonalDocuments />} />
              <Route path="documents/company" element={<CompanyDocuments />} />
              <Route path="documents/onboarding" element={<OnboardingDocuments />} />
              <Route path="documents/benefits" element={<BenefitsDocuments />} />
              <Route path="documents/training" element={<TrainingDocuments />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
