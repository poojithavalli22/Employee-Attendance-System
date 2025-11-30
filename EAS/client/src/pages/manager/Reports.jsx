import { useState } from 'react'
import api from '../../services/api'

export default function Reports() {
  const [filters, setFilters] = useState({ employeeId: '', startDate: '', endDate: '' })
  const [rows, setRows] = useState([])
  const [allEmployees, setAllEmployees] = useState(true)
  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const download = async () => {
    const params = { ...filters }
    if (allEmployees) params.employeeId = ''
    const res = await api.get('/manager/attendance/export', { params, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  const load = async () => {
    const params = { ...filters }
    if (allEmployees) params.employeeId = ''
    const res = await api.get('/manager/attendance/all', { params })
    setRows(res.data.attendance || [])
  }
  return (
    <div className="container">
      <div className="section-title">Reports</div>
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={allEmployees} onChange={e=>setAllEmployees(e.target.checked)} />
            All employees
          </label>
          <input className="input" name="employeeId" placeholder="Employee ID" disabled={allEmployees} value={filters.employeeId} onChange={onChange} />
          <input className="input" name="startDate" type="date" value={filters.startDate} onChange={onChange} />
          <input className="input" name="endDate" type="date" value={filters.endDate} onChange={onChange} />
          <button className="btn btn-primary" onClick={load}>Load</button>
          <button className="btn btn-secondary" onClick={download}>Export CSV</button>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.User?.name} ({r.User?.employeeId})</td>
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
