import { useEffect, useState } from 'react'
import api from '../api/axios'

const DEFAULT_QUERY = 'programming'
const MAX_RESULTS = 12

/* ── Fallback Books (when API fails) ── */
const FALLBACK_BOOKS: LibraryBook[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Programming',
    thumbnail: 'https://books.google.com/books/content?id=hjEFCAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.5,
    ratingsCount: 1250,
    pageCount: 464,
    publishedDate: '2008',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma',
    category: 'Software Engineering',
    thumbnail: 'https://books.google.com/books/content?id=6oHuKQe3TjQC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.7,
    ratingsCount: 890,
    pageCount: 395,
    publishedDate: '1994',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    category: 'Programming',
    thumbnail: 'https://books.google.com/books/content?id=5wBQEp6ruIAC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.6,
    ratingsCount: 1100,
    pageCount: 352,
    publishedDate: '1999',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    category: 'JavaScript',
    thumbnail: 'https://books.google.com/books/content?id=PXa2bby0oQ0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.3,
    ratingsCount: 780,
    pageCount: 176,
    publishedDate: '2008',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    category: 'Computer Science',
    thumbnail: 'https://books.google.com/books/content?id=NLngYyWFl_YC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.8,
    ratingsCount: 2100,
    pageCount: 1312,
    publishedDate: '2009',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: 'Refactoring: Improving the Design of Existing Code',
    author: 'Martin Fowler',
    category: 'Software Engineering',
    thumbnail: 'https://books.google.com/books/content?id=1MsETFPD3I0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.5,
    ratingsCount: 950,
    pageCount: 448,
    publishedDate: '1999',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'You Don\'t Know JS: Scope & Closures',
    author: 'Kyle Simpson',
    category: 'JavaScript',
    thumbnail: 'https://books.google.com/books/content?id=e1qdBgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.4,
    ratingsCount: 620,
    pageCount: 98,
    publishedDate: '2014',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    title: 'Head First Design Patterns',
    author: 'Eric Freeman',
    category: 'Programming',
    thumbnail: 'https://books.google.com/books/content?id=NXIrAQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.6,
    ratingsCount: 1400,
    pageCount: 694,
    publishedDate: '2004',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'Code Complete',
    author: 'Steve McConnell',
    category: 'Software Engineering',
    thumbnail: 'https://books.google.com/books/content?id=LpVCAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.7,
    ratingsCount: 1800,
    pageCount: 960,
    publishedDate: '2004',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    category: 'JavaScript',
    thumbnail: 'https://books.google.com/books/content?id=p1v6DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.5,
    ratingsCount: 890,
    pageCount: 472,
    publishedDate: '2018',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    category: 'Software Engineering',
    thumbnail: 'https://books.google.com/books/content?id=Yq35BY5Fk3gC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    rating: 4.4,
    ratingsCount: 670,
    pageCount: 336,
    publishedDate: '1995',
    previewLink: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    title: 'Cracking the Coding Interview',
    author: 'Gayle Laakmann McDowell',
    category: 'Programming',
    thumbnail: 'https://books.google.com/books/content?id=jD8iswEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    rating: 4.6,
    ratingsCount: 3200,
    pageCount: 687,
    publishedDate: '2015',
    previewLink: null,
  },
]

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

/* ── Helpers ── */
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
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              Preview Book →
            </a>
          )}
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
    const fetchBooksFromAPI = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Try backend API first
        const response = await api.get('/resources', {
          params: {
            type: 'BOOK',
            limit: 50,
          }
        })
        
        const apiBooks = response.data.data.map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          author: resource.book?.author || 'Unknown Author',
          category: resource.category || 'General',
          thumbnail: null,
          rating: null,
          ratingsCount: null,
          pageCount: null,
          publishedDate: null,
          previewLink: null,
        }))
        
        // Filter by search term
        const searchLower = debouncedSearch.toLowerCase()
        const filtered = apiBooks.filter((book: LibraryBook) => 
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.category.toLowerCase().includes(searchLower)
        )
        
        setBooks(filtered.length > 0 ? filtered : apiBooks)
      } catch (backendErr) {
        console.warn('Backend API failed, trying Open Library API:', backendErr)
        
        try {
          // Fallback to Open Library API (free, no rate limit)
          const searchQuery = debouncedSearch || 'programming'
          const openLibResponse = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=12`
          )
          const openLibData = await openLibResponse.json()
          
          const openLibBooks = (openLibData.docs || []).map((doc: any) => ({
            id: doc.key?.replace('/works/', '') || Math.random().toString(),
            title: doc.title || 'Untitled',
            author: doc.author_name?.[0] || 'Unknown Author',
            category: doc.subject?.[0] || 'General',
            thumbnail: doc.cover_i 
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
              : null,
            rating: null,
            ratingsCount: null,
            pageCount: doc.number_of_pages_median || null,
            publishedDate: doc.first_publish_year?.toString() || null,
            previewLink: `https://openlibrary.org${doc.key}`,
          }))
          
          setBooks(openLibBooks.length > 0 ? openLibBooks : FALLBACK_BOOKS)
        } catch (openLibErr) {
          console.warn('Open Library API also failed, using fallback:', openLibErr)
          // Final fallback to hardcoded books
          const searchLower = debouncedSearch.toLowerCase()
          const filtered = FALLBACK_BOOKS.filter(book => 
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower) ||
            book.category.toLowerCase().includes(searchLower)
          )
          setBooks(filtered.length > 0 ? filtered : FALLBACK_BOOKS)
          setError('⚠️ Using sample books')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchBooksFromAPI()
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
                : books.map(book => (
                    <BookCard 
                      key={book.id} 
                      book={book}
                    />
                  ))
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