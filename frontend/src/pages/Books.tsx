import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import '../styles/books.css'

interface Resource {
  id: string
  title: string
  description: string
  isPremium: boolean
  _premiumLocked?: boolean
  book: { author: string; isbn: string; availableCopies: number; totalCopies: number }
}

export default function Books() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Resource[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [msgs, setMsgs] = useState<Record<string, { text: string; ok: boolean }>>({})

  const fetchBooks = async (s = search, p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: 'BOOK', page: String(p), limit: '9' })
      if (s) params.append('search', s)
      const { data } = await api.get(`/resources?${params}`)
      setBooks(data.data.filter((r: any) => r.book))
      setTotalPages(data.meta.totalPages)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks(search, page) }, [page])

  const handleBorrow = async (id: string) => {
    try {
      await api.post(`/books/${id}/borrow`)
      setMsgs(m => ({ ...m, [id]: { text: 'Borrowed — due in 14 days', ok: true } }))
      fetchBooks(search, page)
    } catch (err: any) {
      setMsgs(m => ({ ...m, [id]: { text: err.response?.data?.error || 'Borrow failed', ok: false } }))
    }
  }

  return (
    <div className="library-page">

      {/* Header */}
      <div className="library-header">
        <div className="library-header-inner">
          <div className="library-eyebrow">Library</div>
          <h1 className="library-title">Browse the collection</h1>
          <p className="library-subtitle">Borrow books and eBooks. 14-day lending period, up to 3 at a time.</p>
          <form
            className="library-search-row"
            onSubmit={e => { e.preventDefault(); setPage(1); fetchBooks(search, 1) }}
          >
            <input
              className="library-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or author..."
            />
            <button type="submit" className="library-search-btn">Search</button>
          </form>
        </div>
      </div>

      {/* Body */}
      <div className="library-body">
        {loading ? (
          <div className="library-loading">
            <div>Loading books</div>
            <div className="library-loading-dots">
              <div className="library-loading-dot" />
              <div className="library-loading-dot" />
              <div className="library-loading-dot" />
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="library-empty">No books found</div>
        ) : (
          <div className="library-grid">
            {books.map(r => {
              const avail = r.book.availableCopies
              const total = r.book.totalCopies
              const pct = total > 0 ? Math.round((avail / total) * 100) : 0
              const isAvail = avail > 0

              return (
                <div className="book-card-new" key={r.id}>
                  <div className="book-card-bar" />
                  <div className="book-card-body">

                    {/* Title + badge */}
                    <div className="book-card-top">
                      <h3 className="book-card-title">{r.title}</h3>
                      {r.isPremium && <span className="book-badge-premium">Premium</span>}
                    </div>

                    {/* Description */}
                    {r.description && (
                      <p className="book-card-desc">{r.description}</p>
                    )}

                    {/* Meta */}
                    <div className="book-card-meta">
                      <div className="book-meta-item">
                        <span className="book-meta-icon">✍️</span>
                        {r.book.author}
                      </div>
                      {r.book.isbn && (
                        <div className="book-meta-item">
                          <span className="book-meta-icon">🔖</span>
                          <span className="book-meta-isbn">ISBN {r.book.isbn}</span>
                        </div>
                      )}
                      <div className="book-availability">
                        <div className={`avail-dot ${isAvail ? 'available' : 'unavailable'}`} />
                        <span className={`avail-text ${isAvail ? 'available' : 'unavailable'}`}>
                          {isAvail ? `${avail} of ${total} copies available` : 'All copies borrowed'}
                        </span>
                      </div>
                    </div>

                    {/* Copies bar */}
                    <div className="copies-bar-wrap">
                      <div className="copies-bar-label">
                        <span>Availability</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="copies-bar">
                        <div className="copies-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Message */}
                    {msgs[r.id] && (
                      <div className={`book-msg ${msgs[r.id].ok ? 'ok' : 'err'}`}>
                        {msgs[r.id].text}
                      </div>
                    )}

                    {/* Action */}
                    <div className="book-card-action">
                      {r._premiumLocked ? (
                        <div className="btn-borrow-locked">🔒 Premium required</div>
                      ) : user ? (
                        <button
                          className="btn-borrow"
                          onClick={() => handleBorrow(r.id)}
                          disabled={!isAvail}
                        >
                          {isAvail ? 'Borrow Book' : 'Not Available'}
                        </button>
                      ) : (
                        <Link to="/login" className="btn-borrow-login">
                          Login to borrow
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="library-pagination">
            <button
              className="lib-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >← Previous</button>
            <span className="lib-page-info">Page {page} of {totalPages}</span>
            <button
              className="lib-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next →</button>
          </div>
        )}
      </div>

    </div>
  )
}
