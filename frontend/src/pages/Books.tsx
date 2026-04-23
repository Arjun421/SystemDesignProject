import { useEffect, useState } from 'react'
import BookCard, { type LibraryBook } from '../components/BookCard'

const DEFAULT_QUERY = 'programming'
const MAX_RESULTS = 12
const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes'
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ?? ''

interface GoogleBooksResponse {
  items?: GoogleBookVolume[]
}

interface GoogleBookVolume {
  id: string
  volumeInfo?: {
    title?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

function normalizeThumbnail(thumbnail?: string) {
  return thumbnail ? thumbnail.replace('http://', 'https://') : null
}

function mapBooks(items: GoogleBookVolume[] = []): LibraryBook[] {
  return items.slice(0, MAX_RESULTS).map(item => ({
    id: item.id,
    title: item.volumeInfo?.title?.trim() || 'Untitled Book',
    thumbnail: normalizeThumbnail(
      item.volumeInfo?.imageLinks?.thumbnail ?? item.volumeInfo?.imageLinks?.smallThumbnail
    ),
  }))
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function LoadingState() {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border border-dashed px-6 text-center"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="h-12 w-12 animate-spin rounded-full border-4"
        style={{
          borderColor: 'var(--border)',
          borderTopColor: '#10b981',
        }}
      />
      <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        Loading books
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
        Pulling fresh results from Google Books...
      </p>
    </div>
  )
}

export default function Library() {
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

        if (GOOGLE_BOOKS_API_KEY) {
          url.searchParams.set('key', GOOGLE_BOOKS_API_KEY)
        }

        const response = await fetch(url.toString(), { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Unable to fetch books right now.')
        }

        const data = (await response.json()) as GoogleBooksResponse
        setBooks(mapBooks(data.items))
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setBooks([])
        setError('Something went wrong while loading books. Please try another search.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchBooks()

    return () => controller.abort()
  }, [debouncedSearch])

  return (
    <div
      className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-primary)' }}
    >
      <div className="mx-auto max-w-7xl">
        <section
          className="rounded-[32px] border px-6 py-8 sm:px-8"
          style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-text)',
                  letterSpacing: '0.14em',
                }}
              >
                LearnVault Library
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find your next programming read
              </h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
                Search Google Books instantly and browse a clean library view with cover-first cards.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div
                className="rounded-[20px] border px-4 py-3"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  Query
                </p>
                <p className="mt-2 text-lg font-semibold capitalize">{debouncedSearch}</p>
              </div>
              <div
                className="rounded-[20px] border px-4 py-3"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  Results
                </p>
                <p className="mt-2 text-lg font-semibold">{loading ? '--' : books.length}</p>
              </div>
              <div
                className="rounded-[20px] border px-4 py-3"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  Search
                </p>
                <p className="mt-2 text-lg font-semibold">300ms debounce</p>
              </div>
            </div>
          </div>

          <div
            className="mt-8 flex flex-col gap-3 rounded-[24px] border p-3 sm:flex-row sm:items-center"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[16px]"
              style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)' }}
            >
              <SearchIcon />
            </div>
            <label className="sr-only" htmlFor="library-search">
              Search books
            </label>
            <input
              id="library-search"
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search for react, javascript, system design..."
              className="h-12 flex-1 rounded-[16px] border px-4 text-sm outline-none"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {loading ? 'Updating library...' : `Showing ${books.length} books`}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Results update automatically as you type.
            </p>
          </div>
        </div>

        <section className="mt-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div
              className="rounded-[28px] border px-6 py-12 text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-lg font-semibold">{error}</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Try a different keyword or add your Google Books API key if your project needs it.
              </p>
            </div>
          ) : books.length === 0 ? (
            <div
              className="rounded-[28px] border px-6 py-12 text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-lg font-semibold">No books found</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Try another search term to refresh the library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
