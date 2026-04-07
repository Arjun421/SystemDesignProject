import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

interface Resource {
  id: string
  title: string
  description: string
  type: 'BOOK' | 'COURSE'
  isPremium: boolean
  _premiumLocked?: boolean
  book?: { author: string; availableCopies: number }
  course?: { instructor: string; durationHours: number }
}

export default function Resources() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null)

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '9' })
      if (search) params.append('search', search)
      if (type) params.append('type', type)
      const { data } = await api.get(`/resources?${params}`)
      setResources(data.data)
      setTotalPages(data.meta.totalPages)
    } catch {
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources() }, [page, type])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchResources()
  }

  const handleBorrow = async (id: string) => {
    try {
      await api.post(`/books/${id}/borrow`)
      setActionMsg({ id, msg: 'Borrowed successfully', ok: true })
      fetchResources()
    } catch (err: any) {
      setActionMsg({ id, msg: err.response?.data?.error || 'Failed', ok: false })
    }
  }

  const handleEnroll = async (id: string) => {
    try {
      await api.post(`/courses/${id}/enroll`)
      setActionMsg({ id, msg: 'Enrolled successfully', ok: true })
    } catch (err: any) {
      setActionMsg({ id, msg: err.response?.data?.error || 'Failed', ok: false })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Library</h1>
        <p className="text-gray-500 text-sm">Search books and courses</p>
      </div>

      {/* Search + Filter */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={type}
          onChange={e => { setType(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          <option value="BOOK">Books</option>
          <option value="COURSE">Courses</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No resources found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.type === 'BOOK' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                  {r.type}
                </span>
                {r.isPremium && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{r.title}</h3>
                {r.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>}
              </div>

              {r.book && (
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>Author: {r.book.author}</p>
                  <p>Available: {r.book.availableCopies} copies</p>
                </div>
              )}
              {r.course && (
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>Instructor: {r.course.instructor}</p>
                  <p>Duration: {r.course.durationHours}h</p>
                </div>
              )}

              {actionMsg?.id === r.id && (
                <p className={`text-xs ${actionMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{actionMsg.msg}</p>
              )}

              {user && !r._premiumLocked && (
                r.type === 'BOOK' ? (
                  <button
                    onClick={() => handleBorrow(r.id)}
                    disabled={r.book?.availableCopies === 0}
                    className="mt-auto text-sm bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40"
                  >
                    {r.book?.availableCopies === 0 ? 'Unavailable' : 'Borrow'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(r.id)}
                    className="mt-auto text-sm bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Enroll
                  </button>
                )
              )}

              {r._premiumLocked && (
                <p className="text-xs text-amber-600 mt-auto">Premium access required</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
