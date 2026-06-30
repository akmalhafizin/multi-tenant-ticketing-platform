import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Ticket {
  id: string
  title: string
  status: string
  category: { name: string } | null
  assignedAgent: { name: string } | null
  guestName: string | null
  createdAt: string
  updatedAt: string
}

const statusDisplay: Record<string, { label: string; tone: string }> = {
  OPEN:     { label: 'Open',        tone: 'bg-blue-50 text-blue-700 border border-blue-100' },
  PENDING:  { label: 'Pending',     tone: 'bg-amber-50 text-amber-700 border border-amber-100' },
  ON_HOLD:  { label: 'On Hold',     tone: 'bg-gray-50 text-gray-700 border border-gray-100' },
  RESOLVED: { label: 'Resolved',    tone: 'bg-green-50 text-green-700 border border-green-100' },
  CLOSED:   { label: 'Closed',      tone: 'bg-gray-100 text-gray-500 border border-gray-100' },
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ tickets: Ticket[]; total: number }>('/api/tickets?limit=200')
      .then((res) => setTickets(res.data.tickets))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING').length
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED').length
  const activeCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING' || t.status === 'ON_HOLD').length

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-gray-500">Loading dashboard...</div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Operations Dashboard
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 mt-2">
            {totalTickets} total ticket{totalTickets !== 1 ? 's' : ''} in the system
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 border border-gray-200 rounded-lg group hover:border-red-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              analytics
            </span>
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Issues</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">{totalTickets}</div>
          <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-600 h-full w-[85%]" />
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg group hover:border-red-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              pending_actions
            </span>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              {openTickets} open
            </span>
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Active Issues</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">{activeCount}</div>
          <div className="mt-4 flex gap-1 h-1.5">
            <div className="bg-red-600 h-full w-[30%] rounded-full" />
            <div className="bg-amber-400 h-full w-[40%] rounded-full" />
            <div className="bg-gray-200 h-full w-[30%] rounded-full" />
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg group hover:border-red-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              check_circle
            </span>
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Resolved</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">{resolvedTickets}</div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                {resolvedTickets}
              </div>
            </div>
            <span className="text-xs text-gray-400">resolved tickets</span>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Recent Tickets</h3>
              <Link to="/admin/tickets" className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                View All
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTickets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                        No tickets yet.
                      </td>
                    </tr>
                  ) : (
                    recentTickets.map((t) => {
                      const d = statusDisplay[t.status] || statusDisplay.OPEN
                      return (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{t.title}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${d.tone}`}>
                              {d.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {t.guestName || t.assignedAgent?.name || '—'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
