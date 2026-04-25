import { useState } from 'react'

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

function getFallbackLabel(title: string) {
  return (
    title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase())
      .join('') || 'LV'
  )
}

function formatRating(rating: number | null) {
  if (!rating) {
    return 'New'
  }

  return rating.toFixed(1)
}

function formatPageCount(pageCount: number | null) {
  if (!pageCount) {
    return 'Unknown length'
  }

  return `${pageCount} pages`
}

function formatPublishedDate(publishedDate: string | null) {
  if (!publishedDate) {
    return 'Publish date unavailable'
  }

  if (publishedDate.length >= 4) {
    return `Published ${publishedDate.slice(0, 4)}`
  }

  return `Published ${publishedDate}`
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M12 3.75l2.5 5.07 5.6.82-4.05 3.95.96 5.58L12 16.54 7 19.17l.96-5.58L3.91 9.64l5.6-.82L12 3.75Z" />
    </svg>
  )
}

function PageIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.75 4.75h8.5a2 2 0 0 1 2 2v12.5H8.5a1.75 1.75 0 0 0 0-3.5h8.75" />
      <path d="M6.75 4.75a2 2 0 0 0-2 2v10.75a1.75 1.75 0 0 0 1.75 1.75H8.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.75" y="5.75" width="16.5" height="14.5" rx="2.5" />
      <path d="M7.5 3.75v4" />
      <path d="M16.5 3.75v4" />
      <path d="M3.75 10.25h16.5" />
    </svg>
  )
}

export default function BookCard({ book }: { book: LibraryBook }) {
  const [borrowed, setBorrowed] = useState(false)
  const [imageMissing, setImageMissing] = useState(!book.thumbnail)

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,0.12)]"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'rgba(148, 163, 184, 0.22)',
        boxShadow: '0 10px 35px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        className="relative overflow-hidden border-b"
        style={{
          aspectRatio: '16 / 10',
          background:
            'linear-gradient(135deg, rgba(226, 232, 240, 0.8) 0%, rgba(241, 245, 249, 0.95) 100%)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        }}
      >
        {!imageMissing && book.thumbnail ? (
          <>
            <img
              src={book.thumbnail}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-white/35 dark:from-slate-950/35 dark:to-slate-950/25" />
            <div className="relative flex h-full items-center justify-center p-5">
              <img
                src={book.thumbnail}
                alt={`${book.title} cover`}
                className="h-full max-h-[220px] rounded-[16px] object-contain shadow-[0_16px_32px_rgba(15,23,42,0.22)] transition-transform duration-300 group-hover:scale-[1.03]"
                onError={() => setImageMissing(true)}
                loading="lazy"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="flex h-[70%] w-[42%] items-center justify-center rounded-[18px] border border-white/70 bg-white/80 text-center shadow-[0_16px_32px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div>
                <div className="text-4xl font-semibold tracking-tight">{getFallbackLabel(book.title)}</div>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  LearnVault
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div
          className="inline-flex w-fit rounded-[10px] border px-4 py-2 text-xs font-semibold uppercase"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'rgba(148, 163, 184, 0.18)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.08em',
          }}
        >
          {book.category}
        </div>

        <h3
          className="mt-5 line-clamp-2 min-h-[4.25rem] text-[1.05rem] font-semibold leading-8 sm:text-[1.12rem]"
          style={{ color: 'var(--text-primary)' }}
        >
          {book.title}
        </h3>

        <p className="mt-2 text-[1.05rem]" style={{ color: 'var(--text-muted)' }}>
          by {book.author}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[1.05rem]" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-2">
            <span className="text-amber-500">
              <StarIcon />
            </span>
            <span className="font-semibold">{formatRating(book.rating)}</span>
            {book.ratingsCount ? (
              <span style={{ color: 'var(--text-muted)' }}>({book.ratingsCount.toLocaleString()})</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <PageIcon />
            <span>{formatPageCount(book.pageCount)}</span>
          </div>
        </div>

        <p className="mt-8 text-[2rem] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
          {book.pageCount ? `${book.pageCount} pages` : 'Book'}
        </p>

        <div className="mt-5 flex items-center gap-2 text-[0.97rem]" style={{ color: '#b45309' }}>
          <CalendarIcon />
          <span>{formatPublishedDate(book.publishedDate)}</span>
        </div>

        <div className="mt-7 grid gap-3">
          <button
            type="button"
            onClick={() => setBorrowed(true)}
            disabled={borrowed}
            className="flex h-14 items-center justify-center rounded-[14px] px-5 text-lg font-semibold transition duration-200"
            style={
              borrowed
                ? {
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    cursor: 'not-allowed',
                  }
                : {
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                  }
            }
          >
            {borrowed ? 'Borrowed' : 'Borrow from Library'}
          </button>

          <a
            href={book.previewLink ?? undefined}
            target="_blank"
            rel="noreferrer"
            className={`flex h-14 items-center justify-center rounded-[14px] border px-5 text-lg font-semibold transition duration-200 ${
              book.previewLink ? 'hover:bg-slate-50 dark:hover:bg-slate-800/80' : 'pointer-events-none'
            }`}
            style={{
              borderColor: 'rgba(148, 163, 184, 0.25)',
              color: book.previewLink ? 'var(--text-secondary)' : 'var(--text-faint)',
              backgroundColor: 'var(--surface)',
              opacity: book.previewLink ? 1 : 0.7,
            }}
          >
            {book.previewLink ? 'Book Details' : 'Preview Unavailable'}
          </a>
        </div>
      </div>
    </article>
  )
}
