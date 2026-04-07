import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import PasswordStrength from '../components/PasswordStrength'
import '../styles/auth.css'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    else if (fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters'

    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'

    if (!password) e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      // username derived from full name (lowercase, no spaces)
      const username = fullName.trim().toLowerCase().replace(/\s+/g, '_')
      const { data } = await api.post('/auth/register', { username, email, password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearError = (field: string) => setErrors(p => ({ ...p, [field]: '' }))

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">📚</div>
          <span className="auth-brand-name">LearnVault</span>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">Join thousands of learners today</p>

        {apiError && (
          <div className="auth-alert error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0,marginTop:1}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {apiError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <InputField
            label="Full name"
            value={fullName}
            onChange={v => { setFullName(v); clearError('fullName') }}
            placeholder="John Doe"
            error={errors.fullName}
            autoComplete="name"
          />

          <InputField
            label="Email address"
            type="email"
            value={email}
            onChange={v => { setEmail(v); clearError('email') }}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
          />

          <div className="field-group">
            <InputField
              label="Password"
              value={password}
              onChange={v => { setPassword(v); clearError('password') }}
              placeholder="Min. 8 characters"
              error={errors.password}
              showToggle
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <InputField
            label="Confirm password"
            value={confirmPassword}
            onChange={v => { setConfirmPassword(v); clearError('confirmPassword') }}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            showToggle
            autoComplete="new-password"
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
