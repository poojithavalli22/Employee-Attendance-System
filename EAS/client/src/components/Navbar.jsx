import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const hide = ['/login','/register'].includes(location.pathname)
  const [open, setOpen] = useState(false)
  if (hide) return null
  const initial = (user?.name || 'U').charAt(0).toUpperCase()
  return (
    <nav className="navbar">
      <div className="brand">EAS</div>
      <div className="nav-links" style={{ marginLeft: 'auto' }}>
        {user?.role === 'manager' ? (
          <>
            <Link to="/manager/dashboard">Dashboard</Link>
            <Link to="/employee/mark">Mark</Link>
            <Link to="/manager/attendance">Attendance</Link>
            <Link to="/manager/calendar">Calendar</Link>
            <Link to="/manager/reports">Reports</Link>
          </>
        ) : (
          <>
            <Link to="/employee/dashboard">Dashboard</Link>
            <Link to="/employee/mark">Mark</Link>
            <Link to="/employee/history">History</Link>
          </>
        )}
      </div>
      <div className="profile">
        <div className="avatar" onClick={() => setOpen(!open)}>{initial}</div>
        {open && (
          <div className="dropdown">
            <div className="dropdown-header">{user?.name}</div>
            <Link className="dropdown-item" to="/employee/profile" onClick={() => setOpen(false)}>Profile</Link>
            <button className="dropdown-item" onClick={() => { setOpen(false); logout() }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}
