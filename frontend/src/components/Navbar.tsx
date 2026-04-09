import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../App'   // ← imports from App.tsx directly

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const isDark = theme === 'dark'

  const clr = {
    surface:    isDark ? '#1a1d27' : '#ffffff',
    border:     isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text:       isDark ? '#f1f2f6' : '#0f1117',
    muted:      isDark ? '#8b8fa8' : '#6b7280',
    hover:      isDark ? '#21263a' : '#f3f4f6',
    accent:     '#16a163',
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <style>{`
        .lv-link {
          font-size: 14px; font-weight: 500; color: ${clr.muted};
          text-decoration: none; padding: 6px 10px; border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .lv-link:hover { color: ${clr.text}; background: ${clr.hover}; }

        .lv-toggle {
          display: flex; align-items: center; gap: 6px;
          background: ${clr.hover}; border: 1px solid ${clr.border};
          border-radius: 8px; padding: 7px 13px; cursor: pointer;
          color: ${clr.muted}; font-size: 13px; font-weight: 500;
          font-family: inherit; transition: all 0.2s;
        }
        .lv-toggle:hover { border-color: ${clr.accent}; color: ${clr.text}; }

        .lv-btn-outline {
          background: transparent; color: ${clr.muted};
          border: 1px solid ${clr.border}; border-radius: 8px;
          padding: 7px 14px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: inherit; text-decoration: none;
          display: inline-flex; align-items: center; transition: all 0.2s;
        }
        .lv-btn-outline:hover { color: ${clr.text}; border-color: ${clr.accent}; }

        .lv-btn-solid {
          background: #0f1a13; color: white; border: none;
          border-radius: 8px; padding: 8px 16px; font-size: 13px;
          font-weight: 600; cursor: pointer; font-family: inherit;
          text-decoration: none; display: inline-flex; align-items: center;
          transition: background 0.2s;
        }
        .lv-btn-solid:hover { background: #1a3a24; }
      `}</style>

      <nav style={{
        background: clr.surface,
        borderBottom: `1px solid ${clr.border}`,
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px',
            color: clr.text, textDecoration: 'none',
          }}>
            <div style={{
              width: 32, height: 32, background: '#0f4c35', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4.5C3 3.67 3.67 3 4.5 3h4.5v12H4.5C3.67 15 3 14.33 3 13.5V4.5z" fill="#4CAF82"/>
                <path d="M9 3h4.5C14.33 3 15 3.67 15 4.5v9c0 .83-.67 1.5-1.5 1.5H9V3z" fill="white" opacity="0.6"/>
                <rect x="5" y="6" width="2.5" height="1.2" rx="0.5" fill="white"/>
                <rect x="5" y="8.5" width="2.5" height="1.2" rx="0.5" fill="white"/>
              </svg>
            </div>
            LearnVault
          </Link>

          {/* Centre links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link to="/books" className="lv-link">Library</Link>
            <Link to="/courses" className="lv-link">Courses</Link>
            {user && <Link to="/dashboard" className="lv-link">Dashboard</Link>}
          </div>

          {/* Right — theme toggle + auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* ☀️ / 🌙 always visible */}
            <button onClick={toggleTheme} className="lv-toggle">
              {isDark ? <SunIcon /> : <MoonIcon />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>

            {user ? (
              <>
                <span style={{ fontSize: 13, color: clr.muted }}>Hi, {user.username}</span>
                <button onClick={handleLogout} className="lv-btn-outline">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="lv-btn-outline">Login</Link>
                <Link to="/register" className="lv-btn-solid">Sign up free</Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  )
}