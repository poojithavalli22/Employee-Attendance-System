import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', employeeId: '', department: '', role: 'employee' })
  const [error, setError] = useState('')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
    } catch (err) {
      setError('Registration failed')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 540 }}>
      <div className="card">
        <div className="section-title">Create your account</div>
        <form onSubmit={onSubmit} className="grid grid-2">
          <input className="input" name="name" placeholder="Name" value={form.name} onChange={onChange} />
          <input className="input" name="email" placeholder="Email" value={form.email} onChange={onChange} />
          <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />
          <input className="input" name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={onChange} />
          <input className="input" name="department" placeholder="Department" value={form.department} onChange={onChange} />
          <select className="select" name="role" value={form.role} onChange={onChange}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit">Register</button>
            <a className="btn btn-secondary" href="/login">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  )
}
