import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function EmployeeDashboard() {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const reload = () => api.get('/dashboard/employee').then(r=>setData(r.data))
  useEffect(() => { reload() }, [])
  const quickCheckIn = async () => {
    if (busy) return
    setBusy(true); setMsg('')
    try { await api.post('/attendance/checkin'); await reload() } catch(e){ setMsg('Already checked in or error') }
    setBusy(false)
  }
  const quickCheckOut = async () => {
    if (busy) return
    setBusy(true); setMsg('')
    try { await api.post('/attendance/checkout'); await reload() } catch(e){ setMsg('Already checked out or error') }
    setBusy(false)
  }
  if (!data) return <div className="container">Loading...</div>
  const s = data.monthStats
  const t = data.todayStatus
  return (
    <div className="container">
      <div className="section-title">Employee Dashboard</div>
      <div className="grid grid-3">
        <div className="card">
          <div className="card-title">Today</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>{t.hasCheckedIn ? <span className="badge badge-present">Checked In</span> : <span className="badge badge-absent">Not Checked In</span>} {t.checkInTime || ''}</div>
            <div style={{ marginLeft: 'auto' }}>{t.hasCheckedOut ? <span className="badge badge-present">Checked Out</span> : <span className="badge badge-absent">Not Checked Out</span>} {t.checkOutTime || ''}</div>
          </div>
          {(!t.hasCheckedIn && !t.hasCheckedOut) && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={quickCheckIn} disabled={busy}>Quick Check In</button>
            </div>
          )}
          {(t.hasCheckedIn && !t.hasCheckedOut) && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={quickCheckOut} disabled={busy}>Quick Check Out</button>
            </div>
          )}
          {(t.hasCheckedIn && t.hasCheckedOut) && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" disabled>Quick Check In</button>
              <button className="btn btn-secondary" disabled>Quick Check Out</button>
            </div>
          )}
          {msg && <div style={{ color: 'var(--danger)', marginTop: 8 }}>{msg}</div>}
        </div>
        <div className="card">
          <div className="card-title">This Month</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-present">Present {s.present}</span>
            <span className="badge badge-absent">Absent {s.absent}</span>
            <span className="badge badge-late">Late {s.late}</span>
            <span className="badge badge-halfday">Half-day {s.halfDay}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Total Hours</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{s.totalHours.toFixed(2)}</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Recent (7 days)</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {data.recentAttendance.map((r)=> (
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>
                  {r.status === 'present' && <span className="badge badge-present">present</span>}
                  {r.status === 'absent' && <span className="badge badge-absent">absent</span>}
                  {r.status === 'late' && <span className="badge badge-late">late</span>}
                  {r.status === 'half-day' && <span className="badge badge-halfday">half-day</span>}
                </td>
                <td>{r.checkInTime || '-'}</td>
                <td>{r.checkOutTime || '-'}</td>
                <td>{r.totalHours || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
