import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

interface BorrowRecord {
  id: string
  bookId: string
  status: string
  borrowedAt: string
  dueDate: string
  book: { id: string; resource: { title: string } }
}

interface Enrollment {
  id: string
  courseId: string
  status: string
  enrolledAt: string
  progressPercent: number
  completedAt: string | null
  course: { id: string; resource: { title: string } }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [active, setActive] = useState<BorrowRecord[]>([])
  const [history, setHistory] = useState<BorrowRecord[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [tab, setTab] = useState<'borrows' | 'courses'>('borrows')
  const [loading, setLoading] = useState(false)
  const [msgs, setMsgs] = useState<Record<string, { text: string; ok: boolean }>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [a, h, e] = await Promise.all([
          api.get('/books/active'),
          api.get('/books/history'),
          api.get('/courses/my-enrollments'),
        ])
        setActive(a.data.data)
        setHistory(h.data.data)
        setEnrollments(e.data.data)
      } catch {}
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handleReturn = async (bookId: string, recordId: string) => {
    try {
      await api.post(`/books/${bookId}/return`)
      setMsgs(m => ({ ...m, [recordId]: { text: '✓ Returned successfully', ok: true } }))
      setActive(prev => prev.filter(r => r.id !== recordId))
    } catch (err: any) {
      setMsgs(m => ({ ...m, [recordId]: { text: err.response?.data?.error || 'Failed', ok: false } }))
    }
  }

  const handleProgress = async (courseId: string, enrollmentId: string) => {
    const val = progress[enrollmentId]
    if (val === undefined) return
    try {
      await api.patch(`/courses/${courseId}/progress`, { progress: val })
      setMsgs(m => ({ ...m, [enrollmentId]: { text: `✓ Progress updated to ${val}%`, ok: true } }))
    } catch (err: any) {
      setMsgs(m => ({ ...m, [enrollmentId]: { text: err.response?.data?.error || 'Failed', ok: false } }))
    }
  }

  const allBorrows = [...active, ...history.filter(h => !active.find(a => a.id === h.id))]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-0.5">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, {user?.username}
            {user?.role === 'PREMIUM' && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Premium</span>}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Borrows', value: active.length, sub: 'of 3 max', color: 'text-blue-600' },
            { label: 'Total Borrowed', value: allBorrows.length, sub: 'all time', color: 'text-slate-900' },
            { label: 'Enrolled Courses', value: enrollments.length, sub: 'courses', color: 'text-emerald-600' },
            { label: 'Completed', value: enrollments.filter(e => e.status === 'COMPLETED').length, sub: 'courses done', color: 'text-slate-900' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {[
            { key: 'borrows', label: `Books (${active.length} active)` },
            { key: 'courses', label: `Courses (${enrollments.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-5 py-2 text-sm rounded-lg transition-colors font-medium ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : tab === 'borrows' ? (
          <div className="space-y-3">
            {allBorrows.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-gray-200">
                <p className="text-4xl mb-3">📚</p>
                <p>No borrow history yet</p>
                <a href="/books" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Browse books →</a>
              </div>
            ) : allBorrows.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{r.book.resource.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Borrowed {new Date(r.borrowedAt).toLocaleDateString()} · Due {new Date(r.dueDate).toLocaleDateString()}
                  </p>
                  {msgs[r.id] && <p className={`text-xs mt-1 font-medium ${msgs[r.id].ok ? 'text-green-600' : 'text-red-500'}`}>{msgs[r.id].text}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : r.status === 'RETURNED' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}>
                    {r.status}
                  </span>
                  {r.status === 'ACTIVE' && (
                    <button onClick={() => handleReturn(r.book.id, r.id)}
                      className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-gray-200">
                <p className="text-4xl mb-3">🎓</p>
                <p>No courses enrolled yet</p>
                <a href="/courses" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Browse courses →</a>
              </div>
            ) : enrollments.map(e => (
              <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{e.course.resource.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${e.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : e.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{e.progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                </div>

                {e.status !== 'COMPLETED' && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number" min={0} max={100}
                      value={progress[e.id] ?? e.progressPercent}
                      onChange={ev => setProgress(p => ({ ...p, [e.id]: parseInt(ev.target.value) }))}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => handleProgress(e.course.id, e.id)}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                      Update
                    </button>
                    {msgs[e.id] && <p className={`text-xs font-medium ${msgs[e.id].ok ? 'text-green-600' : 'text-red-500'}`}>{msgs[e.id].text}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
