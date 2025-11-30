import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AllAttendance() {
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState({ employeeId: '', status: '', startDate: '', endDate: '' })
  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const load = async () => {
    const res = await api.get('/manager/attendance/all', { params: filters })
    setRecords(res.data.attendance)
  }
  useEffect(() => { load() }, [])
  return (
    <div className="container">
      <div className="section-title">All Employees Attendance</div>
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <input className="input" name="employeeId" placeholder="Employee ID" value={filters.employeeId} onChange={onChange} />
          <select className="select" name="status" value={filters.status} onChange={onChange}>
            <option value="">Status</option>
            <option value="present">present</option>
            <option value="absent">absent</option>
            <option value="late">late</option>
            <option value="half-day">half-day</option>
          </select>
          <input className="input" name="startDate" type="date" value={filters.startDate} onChange={onChange} />
          <input className="input" name="endDate" type="date" value={filters.endDate} onChange={onChange} />
          <button className="btn btn-primary" onClick={load}>Filter</button>
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
            {records.map((r)=> (
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
