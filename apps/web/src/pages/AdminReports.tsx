import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import StatCard from '../components/StatCard'

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  rating: number | null
  category: { name: string } | null
  assignedAgent: { name: string } | null
  guestName: string | null
  createdAt: string
  resolvedAt: string | null
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500', PENDING: 'bg-amber-500', ON_HOLD: 'bg-gray-500',
  RESOLVED: 'bg-green-500', CLOSED: 'bg-gray-400',
}
const statusLabels: Record<string, string> = {
  OPEN: 'Open', PENDING: 'Pending', ON_HOLD: 'On Hold', RESOLVED: 'Resolved', CLOSED: 'Closed',
}

export default function AdminReports() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ tickets: Ticket[]; total: number }>('/api/tickets?limit=500')
      .then((res) => setTickets(res.data.tickets))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ─── Computed Stats ──────────────────────────────────────────

  const total = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'OPEN')
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING')
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED')
  const closedTickets = tickets.filter((t) => t.status === 'CLOSED')
  const urgentTickets = tickets.filter((t) => t.priority === 'URGENT' && t.status !== 'RESOLVED' && t.status !== 'CLOSED')
  const activeCount = tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)).length

  // Avg resolution time (hours)
  const resolvedWithTime = tickets.filter((t) => t.resolvedAt)
  const avgResolutionHours = resolvedWithTime.length > 0
    ? Math.round(resolvedWithTime.reduce((sum, t) => {
        const diff = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime()
        return sum + diff / (1000 * 60 * 60)
      }, 0) / resolvedWithTime.length)
    : null

  // CSAT
  const ratedTickets = tickets.filter((t) => t.rating != null)
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, t) => sum + t.rating!, 0) / ratedTickets.length).toFixed(1)
    : null

  // Category distribution
  const catMap: Record<string, number> = {}
  tickets.forEach((t) => {
    const name = t.category?.name || 'Uncategorized'
    catMap[name] = (catMap[name] || 0) + 1
  })
  const categoryData = Object.entries(catMap)
    .map(([label, count]) => ({ label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  // Status distribution
  const statusMap: Record<string, number> = {}
  tickets.forEach((t) => { statusMap[t.status] = (statusMap[t.status] || 0) + 1 })
  const statusDist = Object.entries(statusMap)
    .map(([key, count]) => ({ label: statusLabels[key] || key, key, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  // Recent activity (newest tickets + comments would be ideal, tickets is enough)
  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 text-center text-gray-500">Loading reports...</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">Reports</h1>
        <p className="text-lg leading-relaxed text-gray-600 mt-2">
          Facility performance and maintenance analytics based on {total} ticket{total !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="analytics" label="Total Tickets" value={total.toLocaleString()} sub={`${activeCount} active`} accent="red" />
        <StatCard icon="schedule" label="Avg Resolution" value={avgResolutionHours ? `${avgResolutionHours}h` : '—'} sub={avgResolutionHours ? `${resolvedWithTime.length} resolved` : 'No data'} accent="green" />
        <StatCard icon="pending_actions" label="Open Tickets" value={openTickets.length.toString()} sub={`${urgentTickets.length} urgent`} accent="amber" />
        <StatCard icon="star" label="CSAT Score" value={avgRating || '—'} sub={avgRating ? `${ratedTickets.length} ratings` : 'No ratings'} accent="green" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900">Tickets by Category</h3>
            <span className="text-xs text-gray-400">All time</span>
          </div>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tickets yet.</p>
          ) : (
            <div className="space-y-5">
              {categoryData.map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                    <span>{cat.label}</span>
                    <span className="text-gray-900 font-semibold">{cat.percent}% ({cat.count.toLocaleString()})</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-700" style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900">Status Distribution</h3>
            <span className="text-xs text-gray-400">Current</span>
          </div>
          {statusDist.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data.</p>
          ) : (
            <>
              <div className="space-y-4">
                {statusDist.map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[s.key] || 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{s.percent}%</span>
                    <span className="text-xs text-gray-400 w-12 text-right">{s.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-1">
                {statusDist.map((s) => (
                  <div key={s.key} className="h-2 rounded-full first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${s.percent}%`, backgroundColor: (statusColors[s.key] || '#ccc').replace('bg-', '') }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900">Recent Tickets</h3>
            <Link to="/admin/tickets" className="text-xs font-medium text-red-600 hover:underline">View All</Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tickets yet.</p>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {recentTickets.map((t) => (
                <div key={t.id} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">
                    {t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'check_circle' : t.status === 'OPEN' ? 'add_circle' : 'schedule'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <Link to={`/admin/tickets/${t.id}`} className="font-semibold text-red-600 hover:underline">
                        #{t.id.slice(0, 8).toUpperCase()}
                      </Link>
                      {' — '}{t.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.guestName || t.assignedAgent?.name || '—'} · {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
