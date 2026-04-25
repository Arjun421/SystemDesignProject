import { useEffect, useState } from 'react'

const DEFAULT_QUERY = 'programming'
const MAX_RESULTS = 12
const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes'
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ?? ''

/* ── Types ── */
export interface LibraryBook {
  id: string
  title: string
  author: string
  category: string
  thumbnail: string | null
  rating: number | null
  ratingsCount: number | null
  pageCount: number | null
  publishedDate: string | null
  previewLink: string | null
}

interface GoogleBooksResponse {
  items?: GoogleBookVolume[]
}

interface GoogleBookVolume {
  id: string
  volumeInfo?: {
    title?: string
    authors?: string[]
    categories?: string[]
    averageRating?: number
    ratingsCount?: number
    pageCount?: number
    publishedDate?: string
    previewLink?: string
    infoLink?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

/* ── Helpers ── */
function normalizeThumbnail(thumbnail?: string) {
  return thumbnail ? thumbnail.replace('http://', 'https://') : null
}

function mapBooks(items: GoogleBookVolume[] = []): LibraryBook[] {
  return items.slice(0, MAX_RESULTS).map(item => ({
    id: item.id,
    title: item.volumeInfo?.title?.trim() || 'Untitled Book',
    author: item.volumeInfo?.authors?.[0] || 'Unknown Author',
    category: item.volumeInfo?.categories?.[0] || 'Programming',
    thumbnail: normalizeThumbnail(
      item.volumeInfo?.imageLinks?.thumbnail ?? item.volumeInfo?.imageLinks?.smallThumbnail
    ),
    rating: item.volumeInfo?.averageRating ?? null,
    ratingsCount: item.volumeInfo?.ratingsCount ?? null,
    pageCount: item.volumeInfo?.pageCount ?? null,
    publishedDate: item.volumeInfo?.publishedDate ?? null,
    previewLink: item.volumeInfo?.previewLink ?? item.volumeInfo?.infoLink ?? null,
  }))
}

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
}

/* ── Sub-components ── */
function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" style={{ height: 20, width: 20 }}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function Spinner() {
  return (
    <div style={{
      height: 20, width: 20, borderRadius: '50%',
      border: '2px solid rgba(148,163,184,0.35)',
      borderTopColor: '#0f172a',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

/* ── Book Card (matches Course Card exactly) ── */
function BookCard({ book }: { book: LibraryBook }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="course-card">
      {/* Thumbnail */}
      {book.thumbnail && !imgError ? (
        <img
          className="course-thumb"
          src={book.thumbnail}
          alt={book.title}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="course-thumb-placeholder">📚</div>
      )}

      <div className="course-card-body">
        {/* Category tag */}
        {book.category && (
          <span className="course-topic-tag">{book.category}</span>
        )}

        {/* Title */}
        <h3 className="course-card-title">{book.title}</h3>

        {/* Author */}
        <p className="course-author">by {book.author}</p>

        {/* Meta row */}
        <div className="course-meta-row">
          {book.rating !== null && (
            <span className="course-rating">
              <span className="course-rating-stars">{renderStars(book.rating)}</span>
              {book.rating.toFixed(1)}
            </span>
          )}
          {book.pageCount && (
            <span className="course-duration">📖 {book.pageCount} pages</span>
          )}
          {book.publishedDate && (
            <span className="course-lang">
              {book.publishedDate.slice(0, 4)}
            </span>
          )}
        </div>

        {/* Ratings count */}
        {book.ratingsCount !== null && (
          <div className="course-coupon-expiry">
            {book.ratingsCount.toLocaleString()} ratings
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
          {book.previewLink && (
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-enroll-free"
            >
              Preview Book →
            </a>
          )}
          <button
            className="btn-view-course"
            onClick={() => alert(`Borrow: ${book.title}`)}
          >
            Borrow
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton Card (matches course-card shape) ── */
function BookSkeletonCard() {
  return (
    <div className="course-card" style={{ opacity: 0.6 }}>
      <div className="course-thumb-placeholder" style={{ background: '#e2e8f0', animation: 'pulse 1.5s infinite' }}>
        &nbsp;
      </div>
      <div className="course-card-body" style={{ gap: 10 }}>
        {[80, 100, 60, 50, 40].map((w, i) => (
          <div key={i} style={{
            height: i === 1 ? 20 : 14,
            width: `${w}%`,
            borderRadius: 8,
            background: '#e2e8f0',
            animation: 'pulse 1.5s infinite',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── Page ── */
export default function Books() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(DEFAULT_QUERY)
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim() || DEFAULT_QUERY)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchBooks() {
      setLoading(true)
      setError('')
      try {
        const url = new URL(GOOGLE_BOOKS_ENDPOINT)
        url.searchParams.set('q', debouncedSearch)
        url.searchParams.set('maxResults', String(MAX_RESULTS))
        if (GOOGLE_BOOKS_API_KEY) url.searchParams.set('key', GOOGLE_BOOKS_API_KEY)

        const response = await fetch(url.toString(), { signal: controller.signal })
        if (!response.ok) throw new Error('Unable to fetch books right now.')

        const data = (await response.json()) as GoogleBooksResponse
        setBooks(mapBooks(data.items))
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setBooks([])
        setError('Something went wrong while loading books. Try a different keyword.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchBooks()
    return () => controller.abort()
  }, [debouncedSearch])

  return (
    <div className="courses-page">

      {/* ── Header (same as Courses) ── */}
      <div className="courses-header">
        <div className="courses-header-inner">
          <div className="courses-eyebrow">LearnVault Library</div>
          <h1 className="courses-title">Browse books</h1>
          <p className="courses-subtitle">
            Search Google Books and find your next great read.
          </p>

          <form className="courses-controls" onSubmit={e => e.preventDefault()}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute', left: 14,
                color: 'var(--text-muted, #94a3b8)',
                display: 'flex', alignItems: 'center',
              }}>
                <SearchIcon />
              </span>
              <input
                className="courses-search-input"
                style={{ paddingLeft: 44 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search react, javascript, system design..."
              />
              {loading && (
                <span style={{ position: 'absolute', right: 14 }}>
                  <Spinner />
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="courses-body">
        {error ? (
          <div className="courses-empty">⚠ {error}</div>
        ) : (
          <div className="courses-grid">
            {loading
              ? Array.from({ length: MAX_RESULTS }).map((_, i) => <BookSkeletonCard key={i} />)
              : books.length === 0
                ? <div className="courses-empty">No books found. Try a different search.</div>
                : books.map(book => <BookCard key={book.id} book={book} />)
            }
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  )
}