import { useState } from 'react'

export interface LibraryBook {
  id: string
  title: string
  thumbnail: string | null
}

function getFallbackLabel(title: string) {
  return title.split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0]?.toUpperCase()).join('') || 'LV'
}

export default function BookCard({ book }: { book: LibraryBook }) {
  const [borrowed, setBorrowed] = useState(false)
  const [imageMissing, setImageMissing] = useState(!book.thumbnail)

  return (
    <article className="group flex flex-col items-center rounded-[20px] p-[14px] text-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 hover:scale-[1.015]"
      style={{
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.05)',
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
      }}>
      <div className="mb-3 w-full overflow-hidden rounded-[13px]"
        style={{ border: '0.5px solid rgba(0,0,0,0.05)', aspectRatio: '2/3' }}>
        {!imageMissing && book.thumbnail ? (
          <img src={book.thumbnail} alt={`${book.title} cover`}
            className="h-full w-full object-cover" onError={() => setImageMissing(true)} loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(145deg,#e8f5e9,#e3f2fd)' }}>
            <span className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{getFallbackLabel(book.title)}</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aeaeb2]">No Cover</span>
          </div>
        )}
      </div>

      <h3 className="mb-2.5 line-clamp-2 min-h-[2.9em] w-full text-[13px] font-medium leading-[1.45] text-[#1d1d1f]">
        {book.title}
      </h3>

      <button type="button" onClick={() => !borrowed && setBorrowed(true)} disabled={borrowed}
        className="w-full py-2 text-[13px] font-medium transition-all duration-150 active:scale-[0.98]"
        style={{
          borderRadius: '980px',
          border: 'none',
          background: borrowed ? '#f5f5f7' : '#0071e3',
          color: borrowed ? '#aeaeb2' : '#fff',
          cursor: borrowed ? 'default' : 'pointer',
        }}>
        {borrowed ? '✓ Borrowed' : 'Borrow'}
      </button>
    </article>
  )
}