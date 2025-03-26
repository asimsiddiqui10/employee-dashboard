import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PrivateRoutes from './utils/PrivateRoutes'
import RoleBasedRoutes from './utils/RoleBasedRoutes'
import AdminSummary from './components/admin/AdminSummary'
import EmployeeSummary from './components/employee/EmployeeSummary'
import Payroll from './components/employee/Payroll'
import Leave from './components/employee/Leave'
import Notifications from './components/employee/Notifications'
import Settings from './components/employee/Settings'


function App() {
  return (
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
            <Route index element={<AdminSummary/>}></Route>
        </Route>

        <Route path="/employee-dashboard" element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={['employee']}>
              <EmployeeDashboard />
            </RoleBasedRoutes>
          </PrivateRoutes>
        }>
          <Route index element={<EmployeeSummary/>}></Route>
          <Route path="payroll" element={<Payroll/>}></Route>
          <Route path="leave" element={<Leave/>}></Route>
          <Route path="notifications" element={<Notifications/>}></Route>
          <Route path="settings" element={<Settings/>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
