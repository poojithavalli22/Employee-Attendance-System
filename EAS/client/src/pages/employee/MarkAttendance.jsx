import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function MarkAttendance() {
  const [today, setToday] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { api.get('/attendance/today').then(r=>setToday(r.data.today)) }, [])
  const checkIn = async () => {
    setMsg('')
    try { await api.post('/attendance/checkin'); const r = await api.get('/attendance/today'); setToday(r.data.today) } catch(e){ setMsg('Already checked in or error') }
  }
  const checkOut = async () => {
    setMsg('')
    try { await api.post('/attendance/checkout'); const r = await api.get('/attendance/today'); setToday(r.data.today) } catch(e){ setMsg('Already checked out or error') }
  }
  if (!today) return <div className="container">Loading...</div>
  return (
    <div className="container">
      <div className="section-title">Mark Attendance</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>Checked In: {today.hasCheckedIn ? <span className="badge badge-present">Yes</span> : <span className="badge badge-absent">No</span>} {today.checkInTime || ''}</div>
          <div style={{ marginLeft: 'auto' }}>Checked Out: {today.hasCheckedOut ? <span className="badge badge-present">Yes</span> : <span className="badge badge-absent">No</span>} {today.checkOutTime || ''}</div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={checkIn} disabled={today.hasCheckedIn}>Check In</button>
          <button className="btn btn-secondary" onClick={checkOut} disabled={!today.hasCheckedIn || today.hasCheckedOut}>Check Out</button>
        </div>
        {msg && <div style={{ color: 'var(--danger)', marginTop: 8 }}>{msg}</div>}
      </div>
      <div className="card">
        <div className="card-title">Note for all Employees:</div>
        <div>Your Working Hours: 9:00Am to 18:00PM</div>
        <div>Checkin On or before 9:00Am for present</div>
        <div>Checkin On or before 13:00pm for half day</div>
      </div>
    </div>
  )
}
