import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left fade-up">
          <div className="hero-eyebrow">✦ Digital Library & Learning Platform</div>
          <h1 className="hero-title">Read more.<br />Learn faster.<br /><span style={{color:'#16a34a'}}>Grow further.</span></h1>
          <p className="hero-sub">Borrow books, enroll in courses, and track everything — one platform.</p>
          <div className="hero-actions">
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary-dark">
              Get started free →
            </Link>
            <Link to="/books" className="btn-ghost-dark">Browse library</Link>
          </div>
        </div>

        {/* Product UI Preview — shows BOTH library and courses */}
        <div className="hero-ui fade-up-2">
          <div className="ui-topbar">
            <div className="ui-dot" style={{background:'#f87171'}} />
            <div className="ui-dot" style={{background:'#fbbf24'}} />
            <div className="ui-dot" style={{background:'#4ade80'}} />
            <span style={{fontSize:11, color:'#9ca3af', marginLeft:8}}>LearnVault — My Dashboard</span>
          </div>
          <div className="ui-body">

            {/* Borrowed books */}
            <div className="ui-card">
              <div className="ui-card-header">
                <span className="ui-card-title">📚 Borrowed Books</span>
                <span className="ui-badge orange">2 active</span>
              </div>
              {[
                { emoji: '🐍', bg: '#f1f5f9', name: 'Python Crash Course',  due: 'Due in 5 days' },
                { emoji: '📐', bg: '#fff7ed', name: 'Clean Code',           due: 'Due in 11 days' },
              ].map(b => (
                <div className="ui-book-row" key={b.name}>
                  <div className="ui-book-cover" style={{background:b.bg}}>{b.emoji}</div>
                  <div className="ui-book-info">
                    <p className="ui-book-name">{b.name}</p>
                    <p className="ui-book-meta">{b.due}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Active courses */}
            <div className="ui-card">
              <div className="ui-card-header">
                <span className="ui-card-title">🎓 Active Courses</span>
                <span className="ui-badge green">In progress</span>
              </div>
              {[
                { label: 'React & TypeScript', pct: 72 },
                { label: 'System Design',      pct: 31 },
              ].map(c => (
                <div className="ui-progress-row" key={c.label}>
                  <span className="ui-progress-label">{c.label}</span>
                  <div className="ui-progress-bar">
                    <div className="ui-progress-fill" style={{width:`${c.pct}%`}} />
                  </div>
                  <span className="ui-progress-pct">{c.pct}%</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="ui-stats-row">
              <div className="ui-stat"><div className="ui-stat-val">7</div><div className="ui-stat-lbl">Books read</div></div>
              <div className="ui-stat"><div className="ui-stat-val">3</div><div className="ui-stat-lbl">Courses</div></div>
              <div className="ui-stat"><div className="ui-stat-val">14d</div><div className="ui-stat-lbl">Streak</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NUMBERS ── */}
      <div className="numbers-strip">
        <div className="numbers-inner">
          {[
            { val: '8K+',   lbl: 'Books in library' },
            { val: '300+',  lbl: 'Online courses' },
            { val: '25K+',  lbl: 'Active members' },
            { val: '14d',   lbl: 'Lending period' },
          ].map(n => (
            <div className="number-item" key={n.lbl}>
              <div className="number-val">{n.val}</div>
              <div className="number-lbl">{n.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">How it works</div>
          <h2 className="section-title">One platform, two ways to learn</h2>
          <div className="how-flow">
            <div className="how-step">
              <div className="how-step-num">1</div>
              <div className="how-step-title">Borrow a book</div>
              <p className="how-step-desc">Search our library of 8,000+ titles. Borrow up to 3 books at a time with a 14-day lending period.</p>
              <div className="how-step-tags">
                <span className="how-tag">eBooks</span>
                <span className="how-tag">PDFs</span>
                <span className="how-tag">Notes</span>
              </div>
            </div>
            <div className="how-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">2</div>
              <div className="how-step-title">Enroll in a course</div>
              <p className="how-step-desc">Pick a structured course that pairs with your reading. Follow expert-led video lessons at your own pace.</p>
              <div className="how-step-tags">
                <span className="how-tag">Video</span>
                <span className="how-tag">Modules</span>
                <span className="how-tag">Projects</span>
              </div>
            </div>
            <div className="how-arrow">→</div>
            <div className="how-step">
              <div className="how-step-num">3</div>
              <div className="how-step-title">Track everything</div>
              <p className="how-step-desc">Your dashboard shows borrowed books, due dates, course progress, and streaks — all in one view.</p>
              <div className="how-step-tags">
                <span className="how-tag">Due dates</span>
                <span className="how-tag">Progress</span>
                <span className="how-tag">History</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIBRARY + COURSES SPLIT ── */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="split-section">

            {/* Library side */}
            <div className="split-block">
              <div className="split-label">📚 Digital Library</div>
              <h3 className="split-title">Borrow books, not just read about them</h3>
              <p className="split-desc">8,000+ titles across programming, business, design, and academics. Borrow up to 3 at a time. Return anytime.</p>
              <ul className="split-list">
                <li>14-day lending period per book</li>
                <li>Track due dates from your dashboard</li>
                <li>eBooks, PDFs, and reference notes</li>
                <li>Premium titles for subscribers</li>
              </ul>
              <Link to="/books" className="split-cta">Browse library →</Link>
            </div>

            <div className="split-divider" />

            {/* Courses side */}
            <div className="split-block">
              <div className="split-label">🎓 Online Courses</div>
              <h3 className="split-title">Structured learning, not random videos</h3>
              <p className="split-desc">Expert-led courses with modules, progress tracking, and real outcomes. From beginner to advanced.</p>
              <ul className="split-list">
                <li>Video-based, module-structured courses</li>
                <li>Track progress from 0% to 100%</li>
                <li>Paired with relevant library books</li>
                <li>Certificates on completion</li>
              </ul>
              <Link to="/courses" className="split-cta">Explore courses →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── INTERFACE SHOWCASE ── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-label">The interface</div>
          <h2 className="section-title">Built to keep you in flow</h2>
          <div className="showcase-grid">

            {/* Course player */}
            <div className="showcase-panel tall">
              <div className="showcase-header">
                <span className="showcase-header-title">Course Player</span>
                <span className="showcase-header-sub">React & TypeScript</span>
              </div>
              <div className="showcase-body">
                <div className="player-video">
                  <div className="player-play">▶</div>
                </div>
                <div className="player-chapters">
                  {[
                    { label: 'Introduction',        state: 'done'   },
                    { label: 'Component Basics',    state: 'done'   },
                    { label: 'Hooks Deep Dive',     state: 'active' },
                    { label: 'TypeScript Patterns', state: 'todo'   },
                    { label: 'State Management',    state: 'todo'   },
                    { label: 'Final Project',       state: 'todo'   },
                  ].map(ch => (
                    <div className={`player-chapter ${ch.state}`} key={ch.label}>
                      <div className={`player-chapter-dot ${ch.state}`} />
                      {ch.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reading interface */}
            <div className="showcase-panel">
              <div className="showcase-header">
                <span className="showcase-header-title">Reading Interface</span>
                <span className="showcase-header-sub">Clean Code — Ch. 4</span>
              </div>
              <div className="showcase-body">
                <div className="reader-lines">
                  <div className="reader-line full" />
                  <div className="reader-line med" />
                  <div className="reader-line full" />
                  <div className="reader-highlight" />
                  <div className="reader-line full" />
                  <div className="reader-line short" />
                  <div className="reader-line full" />
                  <div className="reader-line med" />
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="showcase-panel">
              <div className="showcase-header">
                <span className="showcase-header-title">Activity Feed</span>
                <span className="showcase-header-sub">Today</span>
              </div>
              <div className="showcase-body">
                <div className="activity-list">
                  {[
                    { color: '#16a34a', text: <><strong>Completed</strong> Hooks Deep Dive</>,  time: '2m ago' },
                    { color: '#0f2b4c', text: <><strong>Started reading</strong> Clean Code</>,  time: '1h ago' },
                    { color: '#ea580c', text: <><strong>Earned</strong> 7-day streak badge</>,   time: '3h ago' },
                    { color: '#6b7280', text: <><strong>Enrolled</strong> System Design path</>, time: 'Yesterday' },
                  ].map((a, i) => (
                    <div className="activity-item" key={i}>
                      <div className="activity-dot" style={{background: a.color}} />
                      <span className="activity-text">{a.text}</span>
                      <span className="activity-time">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CONTENT ECOSYSTEM ── */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-label">How it connects</div>
          <h2 className="section-title">Books and courses, working together</h2>
          <div className="ecosystem-flow">
            <div className="eco-block">
              <div className="eco-icon">📖</div>
              <div className="eco-title">Borrow the book</div>
              <p className="eco-desc">Start with a book from the library. Read at your own pace with a 14-day lending window.</p>
            </div>
            <div className="eco-arrow">→</div>
            <div className="eco-block">
              <div className="eco-icon">🎓</div>
              <div className="eco-title">Take the course</div>
              <p className="eco-desc">Each book links to a related course that teaches the same topic through structured video lessons.</p>
            </div>
            <div className="eco-arrow">→</div>
            <div className="eco-block">
              <div className="eco-icon">📊</div>
              <div className="eco-title">Track both</div>
              <p className="eco-desc">Your dashboard shows borrowed books, due dates, and course progress side by side.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="cta-title">Start building real skills</h2>
        <p className="cta-sub">Free to start. No credit card required.</p>
        <Link to={user ? '/dashboard' : '/register'} className="btn-cta">
          {user ? 'Go to Dashboard →' : 'Get started free →'}
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-full">
        <div className="footer-full-inner">
          <div className="footer-full-top">
            <div className="footer-col-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">📚</div>
                <span className="footer-logo-name">LearnVault</span>
              </div>
              <p className="footer-tagline">Your personal learning system.<br />Books, courses, and structured paths.</p>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Platform</div>
              <Link to="/courses">Courses</Link>
              <Link to="/books">Library</Link>
              <Link to="/dashboard">Dashboard</Link>
              <a href="#">Learning Paths</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
          <div className="footer-full-bottom">
            <span>© 2026 LearnVault. All rights reserved.</span>
            <div className="footer-socials">
              {['𝕏', 'in', '▶', 'gh'].map(s => (
                <a key={s} href="#" className="footer-social">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
