import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../styles/courses.css'
import { toINR } from '../utils/currency'

/* ── Types ── */
interface CourseItem {
  coupon: {
    code: string
    percent_off: number
    discount: { price: number; currency: string }
    regular: { price: number; currency: string }
    valid_until: string
    is_active: number
  } | null
  course: {
    id: number
    slug: string
    name: string
    rating: number
    duration_hours: number
    language: string
    topic: string | null
    image_url: string
    url_with_coupon?: string
    url?: string
    authors: { id: number; name: string; url: string }[]
  }
}

/* ── Constants ── */
const RAPIDAPI_KEY = 'ea58db5b8fmsh6d435775babb762p18cd81jsndb3bf719ff6c'
const RAPIDAPI_HOST = 'udemy-coupons-courses-instructors-data-api.p.rapidapi.com'
const LIMIT = 9

const TOPICS = ['All', 'Web Development', 'Python', 'JavaScript', 'Data Science',
  'Machine Learning', 'React', 'AWS', 'Design', 'Marketing', 'Excel']

/* ── Helpers ── */
function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
}

function formatHours(h: number) {
  if (!h || h === 0) return null
  if (h < 1) return `${Math.round(h * 60)}m`
  return `${h.toFixed(1)}h`
}

/* ── Component ── */
export default function Courses() {
  const [items, setItems] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState('All')
  const [page, setPage] = useState(1)
  const [cursors, setCursors] = useState<string[]>(['']) // index = page-1, value = cursor for that page
  const [hasMore, setHasMore] = useState(false)

  const fetchCourses = useCallback(async (cursor: string) => {
    setLoading(true)
    setError('')
    try {
      const url = new URL(`https://${RAPIDAPI_HOST}/coupons.php`)
      url.searchParams.set('limit', String(LIMIT))
      if (cursor) url.searchParams.set('cursor', cursor)

      const res = await fetch(url.toString(), {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'API error')

      setItems(json.items ?? [])
      setHasMore(json.page?.has_more ?? false)

      // Store next cursor for the next page
      if (json.page?.next_cursor) {
        setCursors(prev => {
          const updated = [...prev]
          updated[page] = json.page.next_cursor // cursor for page+1
          return updated
        })
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load courses')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    const cursor = cursors[page - 1] ?? ''
    fetchCourses(cursor)
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Client-side filter — API doesn't support search param
    // Just trigger re-render; filtering happens in filteredItems
  }

  const filteredItems = items.filter(item => {
    const c = item.course
    const matchTopic = activeTopic === 'All' ||
      (c.topic?.toLowerCase().includes(activeTopic.toLowerCase())) ||
      (c.name?.toLowerCase().includes(activeTopic.toLowerCase()))
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.topic?.toLowerCase().includes(search.toLowerCase())) ||
      c.authors.some(a => a.name.toLowerCase().includes(search.toLowerCase()))
    return matchTopic && matchSearch
  })

  const goNext = () => {
    if (hasMore) setPage(p => p + 1)
  }
  const goPrev = () => {
    if (page > 1) setPage(p => p - 1)
  }

  return (
    <div className="courses-page">

      {/* ── Header ── */}
      <div className="courses-header">
        <div className="courses-header-inner">
          <div className="courses-eyebrow">Live from Udemy</div>
          <h1 className="courses-title">Courses with active coupons</h1>
          <p className="courses-subtitle">
            Real Udemy courses — see the original price and available coupon discount before enrolling.
          </p>

          <form className="courses-controls" onSubmit={handleSearch}>
            <input
              className="courses-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, topic, or instructor..."
            />
            <button type="submit" className="courses-search-btn">Search</button>
          </form>

          <div className="topic-filters">
            {TOPICS.map(t => (
              <button
                key={t}
                className={`topic-chip${activeTopic === t ? ' active' : ''}`}
                onClick={() => setActiveTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="courses-body">
        {loading ? (
          <div className="courses-loading">
            <div>Loading courses</div>
            <div className="courses-loading-dots">
              <div className="courses-loading-dot" />
              <div className="courses-loading-dot" />
              <div className="courses-loading-dot" />
            </div>
          </div>
        ) : error ? (
          <div className="courses-empty">⚠ {error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="courses-empty">No courses match your filter</div>
        ) : (
          <div className="courses-grid">
            {filteredItems.map(item => {
              const c = item.course
              const coupon = item.coupon
              const enrollUrl = c.url_with_coupon || `https://www.udemy.com/course/${c.slug}/`
              const hours = formatHours(c.duration_hours)

              return (
                <div className="course-card" key={`${c.id}-${coupon?.code ?? 'nc'}`}>

                  {/* Thumbnail */}
                  {c.image_url ? (
                    <img
                      className="course-thumb"
                      src={c.image_url}
                      alt={c.name}
                      loading="lazy"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="course-thumb-placeholder">🎓</div>
                  )}

                  <div className="course-card-body">
                    {/* Topic */}
                    {c.topic && (
                      <span className="course-topic-tag">{c.topic}</span>
                    )}

                    {/* Title */}
                    <h3 className="course-card-title">{c.name}</h3>

                    {/* Author */}
                    {c.authors.length > 0 && (
                      <p className="course-author">by {c.authors[0].name}</p>
                    )}

                    {/* Meta */}
                    <div className="course-meta-row">
                      {c.rating > 0 && (
                        <span className="course-rating">
                          <span className="course-rating-stars">{renderStars(c.rating)}</span>
                          {c.rating.toFixed(1)}
                        </span>
                      )}
                      {hours && (
                        <span className="course-duration">⏱ {hours}</span>
                      )}
                      {c.language && c.language !== 'English' && (
                        <span className="course-lang">{c.language}</span>
                      )}
                    </div>

                    {/* Price in INR — hide 100% off coupon badge */}
                    <div className="course-price-row">
                      <span className="course-price-real">
                        {coupon?.regular?.price ? toINR(coupon.regular.price) : '—'}
                      </span>
                      {coupon && parseInt(String(coupon.percent_off)) < 100 && (
                        <span className="course-coupon-badge">
                          {coupon.percent_off}% off
                        </span>
                      )}
                    </div>

                    {/* Coupon expiry */}
                    {coupon?.valid_until && (
                      <div className="course-coupon-expiry">
                        ⏰ Expires {new Date(coupon.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}

                    {/* CTA */}
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      <a
                        href={enrollUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-enroll-free"
                      >
                        Enroll on Udemy →
                      </a>
                      <Link to={`/courses/${c.id}`} className="btn-view-course">
                        Course Details
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="courses-pagination">
            <button className="page-btn" onClick={goPrev} disabled={page === 1}>
              ← Previous
            </button>
            <span className="page-info">Page {page}</span>
            <button className="page-btn" onClick={goNext} disabled={!hasMore}>
              Next →
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
