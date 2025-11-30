import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

export default function MyAttendance() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    const params = {}
    if (month) params.month = month
    if (year) params.year = year
    const h = await api.get('/attendance/my-history', { params })
    const s = await api.get('/attendance/my-summary', { params })
    setRecords(h.data.attendance)
    setSummary(s.data.summary)
  }

  useEffect(() => { load() }, [month, year])

  const byDate = useMemo(() => {
    const m = new Map()
    records.forEach(r => { m.set(new Date(r.date).toDateString(), r) })
    return m
  }, [records])

  const grid = useMemo(() => {
    const today = new Date()
    const mm = month ? parseInt(month)-1 : today.getMonth()
    const yy = year ? parseInt(year) : today.getFullYear()
    const days = new Date(yy, mm+1, 0).getDate()
    const arr = Array.from({ length: days }, (_, i) => new Date(yy, mm, i+1))
    const firstDow = new Date(yy, mm, 1).getDay()
    const offset = (firstDow + 6) % 7
    return { yy, mm, days: arr, offset }
  }, [month, year])

  const prevMonth = () => {
    let m = parseInt(month); let y = parseInt(year)
    if (m > 1) m -= 1; else { m = 12; y -= 1 }
    setMonth(String(m)); setYear(String(y))
  }

  const nextMonth = () => {
    let m = parseInt(month); let y = parseInt(year)
    if (m < 12) m += 1; else { m = 1; y += 1 }
    setMonth(String(m)); setYear(String(y))
  }

  const monthName = () => {
    const mm = parseInt(month) - 1
    const yy = parseInt(year)
    return new Date(yy, mm, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
  }

  return (
    <div className="container">
      <div className="section-title">My Attendance</div>
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <input className="input" placeholder="Month (1-12)" value={month} onChange={e=>setMonth(e.target.value)} />
          <input className="input" placeholder="Year" value={year} onChange={e=>setYear(e.target.value)} />
          <button className="btn btn-primary" onClick={load}>Filter</button>
        </div>
        {summary && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-present">Present {summary.present}</span>
            <span className="badge badge-absent">Absent {summary.absent}</span>
            <span className="badge badge-late">Late {summary.late}</span>
            <span className="badge badge-halfday">Half-day {summary.halfDay}</span>
            <span className="badge badge-present">Hours {summary.totalHours.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="section-title">Calendar</div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-secondary" onClick={prevMonth}>◀</button>
        <div style={{ margin: '0 auto', fontWeight: 700 }}>{monthName()}</div>
        <button className="btn btn-secondary" onClick={nextMonth}>▶</button>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 8 }}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} style={{ color: 'var(--muted)', fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {Array.from({ length: grid.offset }).map((_, i) => (
            <div key={`pad-${i}`} className="calendar-day" />
          ))}
        {grid.days.map(d => {
          const rec = byDate.get(d.toDateString())
          const className = rec ? (rec.status === 'absent' ? 'calendar-day absent' : rec.status === 'late' ? 'calendar-day late' : rec.status === 'half-day' ? 'calendar-day half-day' : 'calendar-day present') : 'calendar-day'
          return (
            <button key={d.toISOString()} onClick={() => setSelected(rec || { date: d, status: 'no-data' })} className={className}>
              <div className="date">{d.getDate()}</div>
              <div className="status">{rec ? rec.status : 'no-data'}</div>
            </button>
          )
        })}
        </div>
      </div>
      {selected && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex' }}>
            <div className="card-title">Details</div>
            <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setSelected(null)}>Close</button>
          </div>
          <div>Date: {new Date(selected.date).toLocaleDateString()}</div>
          <div>Status: {selected.status}</div>
          <div>Check In: {selected.checkInTime || '-'}</div>
          <div>Check Out: {selected.checkOutTime || '-'}</div>
          <div>Total Hours: {selected.totalHours || '-'}</div>
        </div>
      )}
      <div className="card" style={{ marginTop: 12 }}>
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
          {records.map((r)=> (
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
