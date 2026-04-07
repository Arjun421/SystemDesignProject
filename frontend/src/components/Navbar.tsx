import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (to: string) => pathname === to

  const linkStyle = (to: string): React.CSSProperties => ({
    fontSize: 14,
    fontWeight: isActive(to) ? 600 : 500,
    color: isActive(to) ? '#0f2b4c' : '#475569',
    textDecoration: 'none',
    transition: 'color 0.15s',
    padding: '4px 0',
    borderBottom: isActive(to) ? '2px solid #0f2b4c' : '2px solid transparent',
  })

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* Brand */}
        <Link to="/" style={{textDecoration:'none', display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
          <div style={{
            width: 32, height: 32, borderRadius: 7,
            background: '#0f2b4c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', flexShrink: 0,
          }}>📚</div>
          <span style={{fontSize:16, fontWeight:700, color:'#0f172a', letterSpacing:'-0.3px'}}>LearnVault</span>
        </Link>

        {/* Nav links */}
        <div style={{display:'flex', alignItems:'center', gap:28}}>
          <Link to="/books"   style={linkStyle('/books')}>Library</Link>
          <Link to="/courses" style={linkStyle('/courses')}>Courses</Link>
          {user && <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>}
        </div>

        {/* Auth */}
        <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
          {user ? (
            <>
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#0f2b4c',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                {user.username?.[0]?.toUpperCase() ?? 'U'}
              </span>
              {user.role === 'PREMIUM' && (
                <span style={{
                  fontSize: 11, background: '#fefce8', color: '#a16207',
                  padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                  border: '1px solid #fde68a',
                }}>Premium</span>
              )}
              <button
                onClick={() => { logout(); navigate('/') }}
                style={{
                  fontSize: 13, color: '#374151', background: '#fff',
                  border: '1px solid #e5e7eb', borderRadius: 6,
                  padding: '6px 14px', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 500,
                }}
              >Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                fontSize: 14, color: '#374151', textDecoration: 'none',
                fontWeight: 500, padding: '7px 14px',
              }}>Login</Link>
              <Link to="/register" style={{
                fontSize: 14, color: '#fff', textDecoration: 'none',
                fontWeight: 600, padding: '8px 18px', borderRadius: 6,
                background: '#16a34a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                display: 'inline-block',
              }}>Sign up free</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}
