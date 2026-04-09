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

const USD_TO_INR = 84
const PRICE_FILTERS = [
  { value: 'all', label: 'All prices' },
  { value: 'under-1000', label: 'Under Rs. 1,000' },
  { value: '1000-2500', label: 'Rs. 1,000 - Rs. 2,500' },
  { value: '2500-5000', label: 'Rs. 2,500 - Rs. 5,000' },
  { value: 'above-5000', label: 'Above Rs. 5,000' },
] as const

type PriceFilterValue = typeof PRICE_FILTERS[number]['value']

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

function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function buildCourseSearchText(item: CourseItem) {
  const { course, coupon } = item
  return normalizeText([
    course.name,
    course.topic,
    course.language,
    course.slug,
    course.authors.map(author => author.name).join(' '),
    coupon?.code,
  ].filter(Boolean).join(' '))
}

function getCoursePriceInINR(item: CourseItem) {
  const regularPrice = Number(item.coupon?.regular?.price ?? 0)
  if (!regularPrice || Number.isNaN(regularPrice)) return null
  return Math.round(regularPrice * USD_TO_INR)
}

function matchesPrice(item: CourseItem, priceFilter: PriceFilterValue) {
  if (priceFilter === 'all') return true

  const priceInINR = getCoursePriceInINR(item)
  if (priceInINR === null) return false

  switch (priceFilter) {
    case 'under-1000':
      return priceInINR < 1000
    case '1000-2500':
      return priceInINR >= 1000 && priceInINR <= 2500
    case '2500-5000':
      return priceInINR > 2500 && priceInINR <= 5000
    case 'above-5000':
      return priceInINR > 5000
    default:
      return true
  }
}

/* ── Component ── */
export default function Courses() {
  const [items, setItems] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>('all')
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
    const searchableText = buildCourseSearchText(item)
    const matchSearch = !search || searchableText.includes(normalizeText(search))
    const matchPrice = matchesPrice(item, priceFilter)
    return matchSearch && matchPrice
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
            <div className="courses-filter-group">
              <label className="courses-filter-label" htmlFor="price-filter">Price</label>
              <select
                id="price-filter"
                className="courses-filter-select"
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value as PriceFilterValue)}
              >
                {PRICE_FILTERS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="courses-search-btn">Search</button>
          </form>
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
