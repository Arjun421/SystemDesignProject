import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../App'

interface BorrowRecord {
  id: string
  bookId: string
  status: string
  borrowedAt: string
  dueDate: string
  book: { id: string; resource: { title: string } }
}

interface Enrollment {
  id: string
  courseId: string
  status: string
  enrolledAt: string
  progressPercent: number
  completedAt: string | null
  course: { id: string; resource: { title: string } }
}

type Theme = 'light' | 'dark'

// ─── Inline styles (no Tailwind dependency beyond what's already in the project) ───
const getTheme = (t: Theme) => ({
  bg: t === 'dark' ? '#0f1117' : '#f6f7f9',
  surface: t === 'dark' ? '#1a1d27' : '#ffffff',
  surfaceHover: t === 'dark' ? '#21263a' : '#f9fafb',
  border: t === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  text: t === 'dark' ? '#f1f2f6' : '#0f1117',
  textMuted: t === 'dark' ? '#8b8fa8' : '#6b7280',
  textFaint: t === 'dark' ? '#52566a' : '#9ca3af',
  accent: '#16a163',
  accentDark: '#0d7a4a',
  accentBg: t === 'dark' ? 'rgba(22,161,99,0.15)' : '#e3f5ee',
  accentText: t === 'dark' ? '#4ade80' : '#0f5c32',
  amber: t === 'dark' ? '#fbbf24' : '#d97706',
  amberBg: t === 'dark' ? 'rgba(251,191,36,0.15)' : '#fef3c7',
  amberText: t === 'dark' ? '#fbbf24' : '#92400e',
  blue: t === 'dark' ? '#60a5fa' : '#2563eb',
  blueBg: t === 'dark' ? 'rgba(96,165,250,0.15)' : '#eff6ff',
  blueText: t === 'dark' ? '#93c5fd' : '#1d4ed8',
  red: t === 'dark' ? '#f87171' : '#dc2626',
  redBg: t === 'dark' ? 'rgba(248,113,113,0.15)' : '#fef2f2',
  redText: t === 'dark' ? '#fca5a5' : '#991b1b',
})

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function Dashboard() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [active, setActive] = useState<BorrowRecord[]>([])
  const [history, setHistory] = useState<BorrowRecord[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [tab, setTab] = useState<'borrows' | 'courses'>('borrows')
  const [loading, setLoading] = useState(false)
  const [msgs, setMsgs] = useState<Record<string, { text: string; ok: boolean }>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})

  const c = getTheme(theme)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [a, h, e] = await Promise.all([
          api.get('/books/active'),
          api.get('/books/history'),
          api.get('/courses/my-enrollments'),
        ])
        setActive(a.data.data)
        setHistory(h.data.data)
        setEnrollments(e.data.data)
      } catch { }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handleReturn = async (bookId: string, recordId: string) => {
    try {
      await api.post(`/books/${bookId}/return`)
      setMsgs(m => ({ ...m, [recordId]: { text: 'Returned successfully', ok: true } }))
      setActive(prev => prev.filter(r => r.id !== recordId))
    } catch (err: any) {
      setMsgs(m => ({ ...m, [recordId]: { text: err.response?.data?.error || 'Failed to return', ok: false } }))
    }
  }

  const handleProgress = async (courseId: string, enrollmentId: string) => {
    const val = progress[enrollmentId]
    if (val === undefined) return
    try {
      await api.patch(`/courses/${courseId}/progress`, { progress: val })
      setMsgs(m => ({ ...m, [enrollmentId]: { text: `Progress updated to ${val}%`, ok: true } }))
      setEnrollments(prev => prev.map(e =>
        e.id === enrollmentId ? { ...e, progressPercent: val } : e
      ))
    } catch (err: any) {
      setMsgs(m => ({ ...m, [enrollmentId]: { text: err.response?.data?.error || 'Update failed', ok: false } }))
    }
  }

  const allBorrows = [...active, ...history.filter(h => !active.find(a => a.id === h.id))]
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length

  const getDaysUntilDue = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getHour = () => new Date().getHours()
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 18 ? 'Good afternoon' : 'Good evening'

  // ─── Styles ───
  const styles = {
    root: {
      minHeight: '100vh',
      background: c.bg,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: c.text,
      transition: 'background 0.3s, color 0.3s',
    } as React.CSSProperties,


    body: { maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' },

    welcomeSection: { marginBottom: '1.75rem' },
    welcomeTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
    welcomeTitle: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: '-0.5px',
      margin: '0 0 4px',
      fontFamily: "'Fraunces', Georgia, serif",
    },
    welcomeSub: {
      fontSize: 13,
      color: c.textMuted,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    premiumBadge: {
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 100,
      background: c.amberBg,
      color: c.amberText,
      letterSpacing: 0.3,
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10,
      marginBottom: '1.75rem',
    },
    statCard: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: '1rem 1.1rem',
      transition: 'border-color 0.2s',
    },
    statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    statIconWrap: (bg: string) => ({
      width: 34,
      height: 34,
      borderRadius: 9,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    statBadge: (bg: string, color: string) => ({
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 7px',
      borderRadius: 100,
      background: bg,
      color,
    }),
    statVal: {
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1,
      marginBottom: 3,
      fontFamily: "'Fraunces', Georgia, serif",
    },
    statLabel: { fontSize: 11, color: c.textMuted, fontWeight: 500 },
    statSub: { fontSize: 10, color: c.textFaint, marginTop: 1 },

    tabs: {
      display: 'flex',
      gap: 3,
      background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f2f4',
      border: `1px solid ${c.border}`,
      padding: 4,
      borderRadius: 11,
      width: 'fit-content',
      marginBottom: '1.25rem',
    },
    tab: (active: boolean) => ({
      padding: '7px 18px',
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      borderRadius: 8,
      border: active ? `1px solid ${c.border}` : '1px solid transparent',
      background: active ? c.surface : 'transparent',
      color: active ? c.text : c.textMuted,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.15s',
    }),

    list: { display: 'flex', flexDirection: 'column' as const, gap: 8 },

    borrowCard: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 13,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      transition: 'border-color 0.2s',
    },
    bookCover: (bg: string) => ({
      width: 36,
      height: 46,
      borderRadius: 5,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      flexShrink: 0,
    }),
    borrowTitle: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
    borrowMeta: { fontSize: 11, color: c.textMuted },
    statusPill: (bg: string, color: string) => ({
      fontSize: 10,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 100,
      background: bg,
      color,
      flexShrink: 0,
    }),
    returnBtn: {
      fontSize: 11,
      fontWeight: 600,
      padding: '6px 12px',
      borderRadius: 7,
      border: 'none',
      background: '#0f1a13',
      color: 'white',
      cursor: 'pointer',
      flexShrink: 0,
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    msgText: (ok: boolean) => ({
      fontSize: 11,
      fontWeight: 500,
      marginTop: 3,
      color: ok ? c.accent : c.red,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }),

    courseCard: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 13,
      padding: '14px 14px',
      transition: 'border-color 0.2s',
    },
    courseTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
    courseTitle: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
    courseMeta: { fontSize: 11, color: c.textMuted },
    progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: c.textMuted, marginBottom: 5 },
    progressTrack: {
      height: 6,
      background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
      borderRadius: 100,
      overflow: 'hidden',
    },
    progressFill: (pct: number) => ({
      height: '100%',
      width: `${pct}%`,
      background: pct === 100 ? c.accent : `linear-gradient(90deg, ${c.accentDark}, ${c.accent})`,
      borderRadius: 100,
      transition: 'width 0.5s ease',
    }),
    updateRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 },
    progressInput: {
      width: 60,
      border: `1px solid ${c.border}`,
      borderRadius: 7,
      padding: '5px 8px',
      fontSize: 12,
      background: c.bg,
      color: c.text,
      fontFamily: 'inherit',
      outline: 'none',
    },
    updateBtn: {
      fontSize: 11,
      fontWeight: 600,
      padding: '6px 12px',
      borderRadius: 7,
      border: 'none',
      background: c.accent,
      color: 'white',
      cursor: 'pointer',
      fontFamily: 'inherit',
    },

    emptyState: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: '3.5rem 2rem',
      textAlign: 'center' as const,
    },
    emptyIcon: { fontSize: 36, marginBottom: 12 },
    emptyText: { fontSize: 13, color: c.textMuted, marginBottom: 8 },
    emptyLink: {
      fontSize: 12,
      fontWeight: 600,
      color: c.accent,
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    },

    loading: {
      textAlign: 'center' as const,
      padding: '4rem 0',
      color: c.textMuted,
      fontSize: 13,
    },
    loadingDots: {
      display: 'flex',
      justifyContent: 'center',
      gap: 6,
      marginTop: 8,
    },
    dot: (i: number) => ({
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: c.accent,
      animation: `bounce 1s ease-in-out ${i * 0.16}s infinite`,
    }),
  }

  const coverColors = [
    theme === 'dark' ? '#1a3a2a' : '#c5e4d4',
    theme === 'dark' ? '#1a2a3a' : '#d4dcff',
    theme === 'dark' ? '#3a2a1a' : '#ffe9c5',
    theme === 'dark' ? '#2a1a3a' : '#ffd9e8',
  ]
  const coverEmojis = ['📗', '📘', '📙', '📕', '📓', '📒']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lv-fade { animation: fadeIn 0.25s ease; }
        .lv-stat-card:hover { border-color: ${c.accent} !important; }
        .lv-borrow-card:hover { border-color: rgba(22,161,99,0.3) !important; }
        .lv-return-btn:hover { background: #1a3a24 !important; }
        .lv-update-btn:hover { background: #0d7a4a !important; }
        .lv-theme-btn:hover { border-color: ${c.accent} !important; color: ${c.text} !important; }
        .lv-tab:hover { color: ${c.text} !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={styles.root}>
        <div style={styles.body}>
          {/* Welcome */}
          <div style={styles.welcomeSection}>
            <div style={styles.welcomeTop}>
              <div>
                <h1 style={styles.welcomeTitle}>
                  {greeting}, {user?.username} 👋
                </h1>
                <p style={styles.welcomeSub}>
                  Your learning dashboard
                  {user?.role === 'PREMIUM' && (
                    <span style={styles.premiumBadge}>✦ Premium</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            {[
              {
                icon: '📘', iconBg: c.blueBg, label: 'Active Borrows',
                value: active.length, sub: `of 3 max`, badge: active.length > 0 ? 'active' : null,
                badgeBg: c.blueBg, badgeColor: c.blueText,
              },
              {
                icon: '📚', iconBg: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                label: 'Total Borrowed', value: allBorrows.length, sub: 'all time',
              },
              {
                icon: '🎓', iconBg: c.accentBg, label: 'Enrolled Courses',
                value: enrollments.length, sub: `${completedCourses} completed`,
                badge: enrollments.length > 0 ? 'enrolled' : null,
                badgeBg: c.accentBg, badgeColor: c.accentText,
              },
              {
                icon: '✅', iconBg: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                label: 'Completed', value: completedCourses, sub: 'courses done',
              },
            ].map((s) => (
              <div key={s.label} style={styles.statCard} className="lv-stat-card">
                <div style={styles.statTop}>
                  <div style={styles.statIconWrap(s.iconBg)}>
                    <span style={{ fontSize: 15 }}>{s.icon}</span>
                  </div>
                  {s.badge && (
                    <span style={styles.statBadge(s.badgeBg!, s.badgeColor!)}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <div style={styles.statVal}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
                <div style={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {[
              { key: 'borrows', label: `Books`, count: active.length },
              { key: 'courses', label: `Courses`, count: enrollments.length },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                style={styles.tab(tab === t.key)}
                className="lv-tab"
              >
                {t.label}
                <span style={{
                  marginLeft: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 100,
                  background: tab === t.key ? c.accentBg : 'transparent',
                  color: tab === t.key ? c.accentText : c.textFaint,
                }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div style={styles.loading}>
              <div>Loading your data...</div>
              <div style={styles.loadingDots}>
                {[0, 1, 2].map(i => <div key={i} style={styles.dot(i)} />)}
              </div>
            </div>
          ) : tab === 'borrows' ? (
            <div style={styles.list} className="lv-fade">
              {allBorrows.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📚</div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No books borrowed yet</p>
                  <p style={styles.emptyText}>Explore our library and borrow your first book today.</p>
                  <a href="/books" style={styles.emptyLink}>
                    Browse library <ArrowRightIcon />
                  </a>
                </div>
              ) : allBorrows.map((r, i) => {
                const daysLeft = getDaysUntilDue(r.dueDate)
                const isOverdue = daysLeft < 0
                const isDueSoon = daysLeft <= 3 && daysLeft >= 0
                return (
                  <div key={r.id} style={styles.borrowCard} className="lv-borrow-card">
                    <div style={styles.bookCover(coverColors[i % coverColors.length])}>
                      {coverEmojis[i % coverEmojis.length]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.borrowTitle}>{r.book.resource.title}</div>
                      <div style={styles.borrowMeta}>
                        Borrowed {new Date(r.borrowedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        {isOverdue
                          ? <span style={{ color: c.red, fontWeight: 600 }}>Overdue by {Math.abs(daysLeft)}d</span>
                          : isDueSoon
                            ? <span style={{ color: c.amber, fontWeight: 600 }}>Due in {daysLeft}d</span>
                            : `Due ${new Date(r.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        }
                      </div>
                      {msgs[r.id] && (
                        <div style={styles.msgText(msgs[r.id].ok)}>
                          {msgs[r.id].ok ? <CheckIcon /> : null}
                          {msgs[r.id].text}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={styles.statusPill(
                        r.status === 'ACTIVE' ? c.accentBg : r.status === 'RETURNED' ? (theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6') : c.redBg,
                        r.status === 'ACTIVE' ? c.accentText : r.status === 'RETURNED' ? c.textMuted : c.redText
                      )}>
                        {r.status === 'ACTIVE' ? 'Active' : r.status === 'RETURNED' ? 'Returned' : 'Overdue'}
                      </span>
                      {r.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleReturn(r.book.id, r.id)}
                          style={styles.returnBtn}
                          className="lv-return-btn"
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={styles.list} className="lv-fade">
              {enrollments.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎓</div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No courses enrolled yet</p>
                  <p style={styles.emptyText}>Start learning — find a course that excites you.</p>
                  <a href="/courses" style={styles.emptyLink}>
                    Browse courses <ArrowRightIcon />
                  </a>
                </div>
              ) : enrollments.map(e => (
                <div key={e.id} style={styles.courseCard} className="lv-borrow-card">
                  <div style={styles.courseTop}>
                    <div>
                      <div style={styles.courseTitle}>{e.course.resource.title}</div>
                      <div style={styles.courseMeta}>
                        Enrolled {new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {e.completedAt && ` · Completed ${new Date(e.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </div>
                    </div>
                    <span style={styles.statusPill(
                      e.status === 'ACTIVE' ? c.blueBg : e.status === 'COMPLETED' ? c.accentBg : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6'),
                      e.status === 'ACTIVE' ? c.blueText : e.status === 'COMPLETED' ? c.accentText : c.textMuted
                    )}>
                      {e.status === 'ACTIVE' ? 'In progress' : e.status === 'COMPLETED' ? '✓ Completed' : e.status}
                    </span>
                  </div>

                  <div style={styles.progressLabel}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 600, color: e.progressPercent >= 70 ? c.accentText : c.textMuted }}>
                      {e.progressPercent}%
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={styles.progressFill(e.progressPercent)} />
                  </div>

                  {e.status !== 'COMPLETED' && (
                    <div style={styles.updateRow}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={progress[e.id] ?? e.progressPercent}
                        onChange={ev => setProgress(p => ({ ...p, [e.id]: Math.min(100, Math.max(0, parseInt(ev.target.value) || 0)) }))}
                        style={styles.progressInput}
                        placeholder="%"
                      />
                      <button
                        onClick={() => handleProgress(e.course.id, e.id)}
                        style={styles.updateBtn}
                        className="lv-update-btn"
                      >
                        Update progress
                      </button>
                      {msgs[e.id] && (
                        <span style={styles.msgText(msgs[e.id].ok)}>
                          {msgs[e.id].ok && <CheckIcon />}
                          {msgs[e.id].text}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
