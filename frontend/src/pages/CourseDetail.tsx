import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import '../styles/course-detail.css'
import { toINR } from '../utils/currency'

interface CourseData {
  id: string; slug: string; url: string; name: string; headline: string
  description: string; rating: string; course_price: string
  students_amount: string; duration_minutes: string; duration_hours: string
  language: string; primary_category: string; primary_subcategory: string
  topic: string | null; image_url: string; created_at: string; url_with_coupon?: string
}
interface Author { id: string; display_name: string; job_title: string; url: string }
interface CouponData {
  code: string; percent_off: string; discount_price: string
  regular_price: string; valid_until: string; is_active: string
}

const KEY  = 'ea58db5b8fmsh6d435775babb762p18cd81jsndb3bf719ff6c'
const HOST = 'udemy-coupons-courses-instructors-data-api.p.rapidapi.com'

function renderStars(r: number) {
  const full = Math.floor(r), half = r - full >= 0.5
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const [course,    setCourse]    = useState<CourseData | null>(null)
  const [authors,   setAuthors]   = useState<Author[]>([])
  const [coupon,    setCoupon]    = useState<CouponData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [wishlisted,setWishlisted]= useState(false)
  const [copied,    setCopied]    = useState(false)
  const [showFull,  setShowFull]  = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true); setError('')
    fetch(`https://${HOST}/course.php?id=${id}`, {
      headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST },
    })
      .then(r => r.json())
      .then(json => {
        if (!json.ok) throw new Error(json.error || 'Course not found')
        setCourse(json.data.course)
        setAuthors(json.data.authors ?? [])
        setCoupon(json.data.coupon ?? null)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="cd-page">
      <div className="skeleton skeleton-hero" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        {[70, 90, 55, 80, 65].map((w, i) => (
          <div key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  )

  if (error || !course) return (
    <div className="cd-page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:36 }}>⚠️</div>
      <div style={{ fontSize:16, color:'var(--text-secondary)' }}>{error || 'Course not found'}</div>
      <Link to="/courses" style={{ fontSize:14, color:'var(--text-primary)', fontWeight:600 }}>← Back to Courses</Link>
    </div>
  )

  const rating      = parseFloat(course.rating) || 0
  const enrollUrl   = course.url_with_coupon || course.url || `https://www.udemy.com/course/${course.slug}/`
  const initial     = authors[0]?.display_name?.[0]?.toUpperCase() ?? '?'
  const durationHrs = parseFloat(course.duration_hours) || 0
  const durationMin = parseInt(course.duration_minutes) || 0
  const priceINR    = coupon ? toINR(coupon.regular_price) : null
  // Only show coupon badge for partial discounts (not 100%)
  const showCouponBadge = coupon && parseInt(coupon.percent_off) < 100
  const durationText = durationHrs > 0
    ? (durationHrs < 1 ? `${durationMin} min` : `${durationHrs.toFixed(1)} hrs`)
    : null

  return (
    <div className="cd-page">

      {/* ══ HERO ══ */}
      <div className="cd-hero">
        <div className="cd-hero-inner">
          <div>
            {/* Breadcrumb */}
            <div className="cd-breadcrumb">
              <Link to="/courses">Courses</Link>
              {course.primary_category && <><span>›</span><span>{course.primary_category}</span></>}
              {course.primary_subcategory && <><span>›</span><span style={{ color:'var(--hero-muted)' }}>{course.primary_subcategory}</span></>}
            </div>

            {course.topic && <div className="cd-topic-tag">{course.topic}</div>}
            <h1 className="cd-title">{course.name}</h1>
            {course.headline && <p className="cd-headline">{course.headline}</p>}

            {/* Rating + students */}
            <div className="cd-meta-row">
              {rating > 0 && (
                <>
                  <span className="cd-rating-val">{rating.toFixed(1)}</span>
                  <span className="cd-stars">{renderStars(rating)}</span>
                  <span className="cd-dot">·</span>
                </>
              )}
              {parseInt(course.students_amount) > 0 && (
                <span className="cd-students">{parseInt(course.students_amount).toLocaleString()} students</span>
              )}
              {course.language && <><span className="cd-dot">·</span><span className="cd-lang-badge">{course.language}</span></>}
              {durationText && <><span className="cd-dot">·</span><span className="cd-students">{durationText}</span></>}
            </div>

            {/* Instructor */}
            {authors[0] && (
              <div className="cd-instructor-row">
                <div className="cd-instructor-avatar">{initial}</div>
                <span>by</span>
                <a href={authors[0].url} target="_blank" rel="noopener noreferrer" className="cd-instructor-name">
                  {authors[0].display_name}
                </a>
                {authors[0].job_title && (
                  <span style={{ color:'var(--hero-muted)', fontSize:12 }}>· {authors[0].job_title}</span>
                )}
              </div>
            )}

            {course.created_at && (
              <div style={{ fontSize:12, color:'var(--hero-muted)', marginTop:10 }}>
                Last updated {new Date(course.created_at).toLocaleDateString('en-IN', {month:'long', year:'numeric'})}
              </div>
            )}

            {/* Mobile price strip */}
            <div className="cd-mobile-price">
              <span className="cd-mobile-price-val">{priceINR ?? course.course_price}</span>
              {showCouponBadge && (
                <span className="cd-coupon-badge">{coupon!.percent_off}% off</span>
              )}
              {coupon?.valid_until && (
                <span className="cd-coupon-expiry">
                  ⏰ Coupon expires {new Date(coupon.valid_until).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                </span>
              )}
              <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn-enroll-cta" style={{marginTop:10}}>
                Enroll on Udemy →
              </a>
            </div>
          </div>

          {/* Sticky card */}
          <div className="cd-hero-card">
            <div className="cd-thumb-wrap">
              {course.image_url
                ? <img className="cd-thumb" src={course.image_url} alt={course.name} />
                : <div className="cd-thumb-placeholder">🎓</div>
              }
              <div className="cd-play-overlay"><div className="cd-play-btn">▶</div></div>
            </div>
            <div className="cd-card-body">
              {/* Price in INR */}
              <div className="cd-price-row">
                <span className="cd-price-inr">{priceINR ?? course.course_price}</span>
                {showCouponBadge && (
                  <span className="cd-coupon-badge">{coupon!.percent_off}% off</span>
                )}
              </div>

              {coupon?.valid_until && (
                <div className="cd-coupon-expiry">
                  ⏰ Coupon expires {new Date(coupon.valid_until).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                </div>
              )}

              <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn-enroll-cta">
                Enroll on Udemy →
              </a>
              <button className={`btn-wishlist${wishlisted ? ' saved' : ''}`} onClick={() => setWishlisted(w => !w)}>
                {wishlisted ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
              </button>

              <div className="cd-includes">
                <div className="cd-includes-title">This course includes</div>
                {durationText && (
                  <div className="cd-include-item"><span className="cd-include-icon">⏱</span>{durationText} of video</div>
                )}
                <div className="cd-include-item"><span className="cd-include-icon">🌐</span>{course.language} language</div>
                <div className="cd-include-item"><span className="cd-include-icon">📱</span>Mobile & desktop access</div>
                <div className="cd-include-item"><span className="cd-include-icon">♾️</span>Full lifetime access</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="cd-body">
        <div className="cd-main">

          {/* About */}
          <div className="cd-section-block">
            <h2 className="cd-section-heading">About this course</h2>
            <div className="cd-description">
              <div style={{ maxHeight: showFull ? 'none' : 220, overflow:'hidden', position:'relative' }}>
                <div dangerouslySetInnerHTML={{ __html: course.description || '<p>No description available.</p>' }} />
                {!showFull && (
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:64, background:'linear-gradient(transparent,var(--overlay-fade))' }} />
                )}
              </div>
              <button className="cd-read-more" onClick={() => setShowFull(v => !v)}>
                {showFull ? 'Show less ↑' : 'Show more ↓'}
              </button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="cd-section-block">
            <h2 className="cd-section-heading">Course overview</h2>
            <div className="cd-stats-grid">
              {[
                { icon:'👥', label:'Students', value: parseInt(course.students_amount) > 0 ? parseInt(course.students_amount).toLocaleString('en-IN') : '—' },
                { icon:'⭐', label:'Rating',   value: rating > 0 ? `${rating.toFixed(1)} / 5` : '—' },
                { icon:'⏱', label:'Duration',  value: durationText ?? '—' },
                { icon:'🌐', label:'Language',  value: course.language || '—' },
                { icon:'📂', label:'Category',  value: course.primary_subcategory || course.primary_category || '—' },
                { icon:'💰', label:'Price',     value: priceINR ?? course.course_price },
              ].map(s => (
                <div className="cd-stat-card" key={s.label}>
                  <div className="cd-stat-icon">{s.icon}</div>
                  <div className="cd-stat-value">{s.value}</div>
                  <div className="cd-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          {authors[0] && (
            <div className="cd-section-block">
              <h2 className="cd-section-heading">Instructor</h2>
              <div className="cd-instructor-card">
                <div className="cd-instructor-card-header">
                  <div className="cd-instructor-big-avatar">{initial}</div>
                  <div>
                    <a href={authors[0].url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                      <p className="cd-instructor-card-name">{authors[0].display_name}</p>
                    </a>
                    {authors[0].job_title && <p className="cd-instructor-card-title">{authors[0].job_title}</p>}
                  </div>
                </div>
                <p className="cd-instructor-bio">
                  View full profile and all courses by this instructor on{' '}
                  <a href={authors[0].url} target="_blank" rel="noopener noreferrer" style={{ color:'var(--text-primary)', fontWeight:600 }}>
                    Udemy →
                  </a>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ══ SIDEBAR ══ */}
        <div className="cd-sidebar">
          <div className="cd-sidebar-section">
            <div className="cd-price-row">
              <span className="cd-price-inr">{priceINR ?? course.course_price}</span>
              {showCouponBadge && (
                <span className="cd-coupon-badge">{coupon!.percent_off}% off</span>
              )}
            </div>
            {coupon?.valid_until && (
              <div className="cd-coupon-expiry" style={{marginBottom:12}}>
                ⏰ Expires {new Date(coupon.valid_until).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
              </div>
            )}
            <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="btn-enroll-cta">
              Enroll on Udemy →
            </a>
            <button className={`btn-wishlist${wishlisted ? ' saved' : ''}`} onClick={() => setWishlisted(w => !w)}>
              {wishlisted ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>

          <div className="cd-sidebar-section">
            <div className="cd-sidebar-section-title">Quick facts</div>
            {rating > 0 && <div className="cd-include-item"><span className="cd-include-icon">⭐</span>{rating.toFixed(1)} rating</div>}
            {parseInt(course.students_amount) > 0 && <div className="cd-include-item"><span className="cd-include-icon">👥</span>{parseInt(course.students_amount).toLocaleString('en-IN')} students</div>}
            {durationText && <div className="cd-include-item"><span className="cd-include-icon">⏱</span>{durationText}</div>}
            <div className="cd-include-item"><span className="cd-include-icon">🌐</span>{course.language}</div>
            {course.primary_category && <div className="cd-include-item"><span className="cd-include-icon">📂</span>{course.primary_category}{course.primary_subcategory && ` › ${course.primary_subcategory}`}</div>}
          </div>

          <div className="cd-sidebar-section">
            <div className="cd-sidebar-section-title">Share</div>
            <div className="cd-share-row">
              <button className="cd-share-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2000) }}>
                🔗 {copied ? 'Copied!' : 'Copy link'}
              </button>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(course.name)}&url=${encodeURIComponent(enrollUrl)}`} target="_blank" rel="noopener noreferrer" className="cd-share-btn" style={{textDecoration:'none'}}>
                𝕏 Tweet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
