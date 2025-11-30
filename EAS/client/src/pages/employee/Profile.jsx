import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Profile() {
  const [user, setUser] = useState(null)
  useEffect(() => { api.get('/auth/me').then(r=>setUser(r.data.user)) }, [])
  if (!user) return <div className="container">Loading...</div>
  return (
    <div className="container">
      <div className="section-title">Profile</div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <div><span style={{ color: 'var(--muted)' }}>Name</span><div style={{ fontWeight: 600 }}>{user.name}</div></div>
          <div><span style={{ color: 'var(--muted)' }}>Email</span><div style={{ fontWeight: 600 }}>{user.email}</div></div>
          <div><span style={{ color: 'var(--muted)' }}>Employee ID</span><div style={{ fontWeight: 600 }}>{user.employeeId}</div></div>
          <div><span style={{ color: 'var(--muted)' }}>Department</span><div style={{ fontWeight: 600 }}>{user.department || '-'}</div></div>
          <div><span style={{ color: 'var(--muted)' }}>Role</span><div style={{ fontWeight: 600 }}>{user.role}</div></div>
        </div>
      </div>
    </div>
  )
}
