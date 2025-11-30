import { useEffect, useState } from 'react'
import api from '../../services/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

export default function ManagerDashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api.get('/dashboard/manager').then(r=>setData(r.data)) }, [])
  if (!data) return <div className="container">Loading...</div>
  const weekly = Object.entries(data.weeklyTrend).map(([date, v]) => ({ date, ...v }))
  const dept = Object.entries(data.departmentWiseAttendance).map(([name, v]) => ({ name, value: v.present }))
  const colors = ['#8884d8','#82ca9d','#ffc658','#ff7f50','#8dd1e1']
  return (
    <div className="container">
      <div className="section-title">Manager Dashboard</div>
      <div className="grid grid-3">
        <div className="card">
          <div className="card-title">Total Employees</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.teamStats.totalEmployees}</div>
        </div>
        <div className="card">
          <div className="card-title">Today</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-present">Present {data.teamStats.presentToday}</span>
            <span className="badge badge-absent">Absent {data.teamStats.absentToday}</span>
            <span className="badge badge-late">Late {data.teamStats.lateArrivals}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Manager</div>
          <div>{data.manager.name} ({data.manager.employeeId})</div>
        </div>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ height: 340 }}>
          <div className="card-title">Weekly Attendance Trend</div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={weekly}>
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#22c55e" />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                <Bar dataKey="halfDay" name="Half Day" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ height: 340 }}>
          <div className="card-title">Department-wise Attendance</div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dept} dataKey="value" nameKey="name" outerRadius={120}>
                  {dept.map((entry, index) => (
                    <Cell key={`c-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Absent Employees Today</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {data.todayDetails.absent.map(a => (
            <div key={a.id} className="card" style={{ padding: 10 }}>
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div style={{ color: 'var(--muted)' }}>{a.employeeId}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
