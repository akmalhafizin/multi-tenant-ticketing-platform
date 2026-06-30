import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  category: { name: string } | null
  assignedAgent: { id: string; name: string } | null
  guestName: string | null
  publicToken: string
  createdAt: string
}

interface Category {
  id: string
  name: string
  _count?: { tickets: number }
}

/**
 * Normalize API status values to match the Status type used in the old mock.
 * API uses: OPEN, PENDING, ON_HOLD, RESOLVED, CLOSED
 * We keep uppercase for display but map to a simpler set for the UI.
 */
const statusDisplay: Record<string, { label: string; tone: string }> = {
  OPEN:     { label: 'PENDING',  tone: 'bg-red-50 border-red-200 text-red-700' },
  PENDING:  { label: 'PENDING',  tone: 'bg-red-50 border-red-200 text-red-700' },
  ON_HOLD:  { label: 'IN-PROGRESS', tone: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  RESOLVED: { label: 'COMPLETED', tone: 'bg-green-50 border-green-200 text-green-700' },
  CLOSED:   { label: 'COMPLETED', tone: 'bg-green-50 border-green-200 text-green-700' },
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [ticketRes, catRes] = await Promise.all([
          api<{ tickets: Ticket[]; total: number }>('/api/tickets'),
          api<Category[]>('/api/categories'),
        ])
        setTickets(ticketRes.data.tickets)
        setCategories(catRes.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute stats from tickets
  const totalTickets = tickets.length
  const pendingAction = tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING').length
  const activeTechnicians = new Set(
    tickets.filter((t) => t.assignedAgent?.name).map((t) => t.assignedAgent!.name)
  ).size
  const completedToday = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length

  // Category distribution
  const catCounts: Record<string, number> = {}
  tickets.forEach((t) => {
    const name = t.category?.name || 'Uncategorized'
    catCounts[name] = (catCounts[name] || 0) + 1
  })
  const maxCatCount = Math.max(...Object.values(catCounts), 1)
  const categoryDistribution = Object.entries(catCounts)
    .map(([label, count]) => ({
      label,
      percent: Math.round((count / totalTickets) * 100),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-gray-500">
        Loading tickets...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-gray-400">assignment</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{totalTickets}</p>
          <p className="text-sm text-gray-500">Total Tickets</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2 border-l-4 border-l-red-600">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-red-600">priority_high</span>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Action Required</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{pendingAction}</p>
          <p className="text-sm text-gray-500">Pending Action</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-gray-500">engineering</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Field</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{activeTechnicians}</p>
          <p className="text-sm text-gray-500">Active Technicians</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2 border-l-4 border-l-green-600">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Success</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{completedToday}</p>
          <p className="text-sm text-gray-500">Resolved / Closed</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Ticket Table Container */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-semibold text-gray-900">Service Tickets</h3>
          <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">filter_list</span> Filter
            </button>
            <Link
              to="/admin/tickets/create"
              className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm mr-2">add</span> Create Ticket
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No tickets yet. Create one or wait for customer submissions.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const display = statusDisplay[ticket.status] || statusDisplay.OPEN
                  const shortId = ticket.id.slice(0, 8).toUpperCase()
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/tickets/${ticket.id}`}
                          className="text-red-600 font-bold hover:underline font-mono text-sm"
                        >
                          #{shortId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{ticket.title}</div>
                        {ticket.guestName && (
                          <p className="text-xs text-gray-400 mt-0.5">by {ticket.guestName}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                          {ticket.category?.name || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${display.tone}`}>
                          {display.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ticket.assignedAgent?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/tickets/${ticket.id}`}
                          className="text-red-600 hover:text-red-700 font-bold text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* Service Category Distribution */}
      {categoryDistribution.length > 0 && (
        <section className="mt-10">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-semibold text-gray-900">Service Category Distribution</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-6 lg:col-span-2">
                {categoryDistribution.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                      <span>{cat.label}</span>
                      <span className="text-red-600">
                        {cat.percent}% ({cat.count} Ticket{cat.count !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col justify-center items-center text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">pie_chart</span>
                <p className="text-sm font-semibold text-gray-700">Live Data</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Category distribution based on {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
