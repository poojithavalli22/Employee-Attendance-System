import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

export default function TeamCalendar() {
  const now = new Date()
  const [employeeId, setEmployeeId] = useState('')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [records, setRecords] = useState([])
  const [employee, setEmployee] = useState(null)
  const [allEmployees, setAllEmployees] = useState(true)
  const [modal, setModal] = useState(null)

  const load = async () => {
    const params = {}
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month)-1, 1).toISOString()
      const end = new Date(parseInt(year), parseInt(month), 0).toISOString()
      params.startDate = start
      params.endDate = end
    }
    if (!allEmployees && employeeId) {
      params.employeeId = employeeId
    }
    const res = await api.get('/manager/attendance/all', { params })
    setRecords(res.data.attendance)
    if (!allEmployees && employeeId) {
      const emp = res.data.attendance.find(a => a.User?.employeeId === employeeId)?.User
      setEmployee(emp || null)
    } else {
      setEmployee(null)
    }
  }

  const byDate = useMemo(() => {
    const m = new Map()
    records.forEach(r => {
      const key = new Date(r.date).toDateString()
      const day = m.get(key) || { present: [], absent: [], late: [], halfDay: [] }
      if (r.status === 'present') day.present.push(r)
      else if (r.status === 'absent') day.absent.push(r)
      else if (r.status === 'late') day.late.push(r)
      else if (r.status === 'half-day') day.halfDay.push(r)
      m.set(key, day)
    })
    return m
  }, [records])

  const grid = useMemo(() => {
    const today = new Date()
    const mm = month ? parseInt(month)-1 : today.getMonth()
    const yy = year ? parseInt(year) : today.getFullYear()
    const days = new Date(yy, mm+1, 0).getDate()
    const arr = Array.from({ length: days }, (_, i) => new Date(yy, mm, i+1))
    const firstDow = new Date(yy, mm, 1).getDay() // 0=Sun
    const offset = (firstDow + 6) % 7 // Monday-first
    return { yy, mm, days: arr, offset }
  }, [month, year])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, employeeId, allEmployees])

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
      <div className="section-title">Team Calendar View</div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-secondary" onClick={prevMonth}>◀</button>
        <div style={{ margin: '0 auto', fontWeight: 700 }}>{monthName()}</div>
        <button className="btn btn-secondary" onClick={nextMonth}>▶</button>
      </div>
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={allEmployees} onChange={e=>setAllEmployees(e.target.checked)} />
            All employees
          </label>
          <input className="input" placeholder="Employee ID" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} />
          <input className="input" placeholder="Month (1-12)" value={month} onChange={e=>setMonth(e.target.value)} />
          <input className="input" placeholder="Year" value={year} onChange={e=>setYear(e.target.value)} />
          <button className="btn btn-primary" onClick={load}>Load</button>
        </div>
        {!allEmployees && employee && <div style={{ color: 'var(--muted)' }}>{employee.name} ({employee.employeeId})</div>}
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
            const className = rec ?
              (rec.absent.length && !rec.present.length && !rec.late.length && !rec.halfDay.length ? 'calendar-day absent' :
               rec.late.length ? 'calendar-day late' :
               rec.halfDay.length ? 'calendar-day half-day' : 'calendar-day present') : 'calendar-day'
            const counts = rec ? {
              present: rec.present.length,
              absent: rec.absent.length,
              late: rec.late.length,
              halfDay: rec.halfDay.length,
            } : { present: 0, absent: 0, late: 0, halfDay: 0 }
            return (
              <button key={d.toISOString()} className={className} onClick={() => setModal({ date: d, details: rec })}>
                <div className="date">{d.getDate()}</div>
                <div className="status">Present: {counts.present}</div>
                <div className="status">Absent: {counts.absent}</div>
                <div className="status">Late: {counts.late}</div>
                <div className="status">Half Day: {counts.halfDay}</div>
              </button>
            )
          })}
        </div>
      </div>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="card-title">Details for {modal.date.toLocaleDateString()}</div>
              <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setModal(null)}>Close</button>
            </div>
            {!modal.details && <div style={{ color: 'var(--muted)' }}>No data</div>}
            {modal.details && (
              <div className="grid grid-2" style={{ marginTop: 8 }}>
                <div className="card">
                  <div className="card-title">Present</div>
                  <ul>
                    {modal.details.present.map(a => (
                      <li key={a.id}>{a.User?.name} ({a.User?.employeeId})</li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <div className="card-title">Absent</div>
                  <ul>
                    {modal.details.absent.map(a => (
                      <li key={a.id}>{a.User?.name} ({a.User?.employeeId})</li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <div className="card-title">Late</div>
                  <ul>
                    {modal.details.late.map(a => (
                      <li key={a.id}>{a.User?.name} ({a.User?.employeeId})</li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <div className="card-title">Half Day</div>
                  <ul>
                    {modal.details.halfDay.map(a => (
                      <li key={a.id}>{a.User?.name} ({a.User?.employeeId})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
