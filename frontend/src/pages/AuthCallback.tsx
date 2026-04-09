import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token   = params.get('token')
    const userStr = params.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        login(token, user)
        navigate('/dashboard', { replace: true })
      } catch {
        navigate('/login?error=oauth_failed', { replace: true })
      }
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 12,
      fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)',
      background: 'var(--page-bg)',
    }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <p style={{ fontSize: 15 }}>Signing you in with Google...</p>
    </div>
  )
}
