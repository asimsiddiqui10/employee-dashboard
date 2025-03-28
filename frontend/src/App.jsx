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
import AuthProvider from './context/authContext'
import EmployeeHome from './components/employee/EmployeeHome'
import MyDetails from './components/employee/MyDetails'

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
    <AuthProvider>
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
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
