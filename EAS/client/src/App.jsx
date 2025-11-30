import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import EmployeeDashboard from './pages/employee/Dashboard'
import MarkAttendance from './pages/employee/MarkAttendance'
import MyAttendance from './pages/employee/MyAttendance'
import Profile from './pages/employee/Profile'
import ManagerDashboard from './pages/manager/Dashboard'
import AllAttendance from './pages/manager/AllAttendance'
import TeamCalendar from './pages/manager/TeamCalendar'
import Reports from './pages/manager/Reports'
import PrivateRoute from './routes/PrivateRoute'

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute roles={["employee","manager"]} />}> 
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/mark" element={<MarkAttendance />} />
          <Route path="/employee/history" element={<MyAttendance />} />
          <Route path="/employee/profile" element={<Profile />} />
        </Route>
        <Route element={<PrivateRoute roles={["manager"]} />}> 
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/attendance" element={<AllAttendance />} />
          <Route path="/manager/calendar" element={<TeamCalendar />} />
          <Route path="/manager/reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}
