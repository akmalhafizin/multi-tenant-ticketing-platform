import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import TicketControls from '../components/TicketControls'
import TicketInfoPanel from '../components/TicketInfoPanel'
import TicketTimeline from '../components/TicketTimeline'
import TicketReplyForm from '../components/TicketReplyForm'
import type { TicketStatus, TicketPriority } from '../types'

interface TicketDetail {
  id: string; title: string; description: string | null; status: string; priority: string
  category: { id: string; name: string } | null
  assignedAgent: { id: string; name: string; email: string } | null
  guestName: string | null; guestEmail: string | null; guestPhone: string | null
  publicToken: string; createdAt: string; updatedAt: string; resolvedAt: string | null
  attachments: { id: string; fileName: string; fileType: string; fileSize: number; url: string }[]
  comments: { id: string; authorType: 'AGENT' | 'GUEST'; user: { id: string; name: string } | null; guestName: string | null; body: string; isInternal: boolean; createdAt: string }[]
}
interface Category { id: string; name: string }
interface StaffUser { id: string; name: string | null; email: string; role: string }

const statusMap: Record<string, TicketStatus> = { OPEN: 'open', PENDING: 'pending', ON_HOLD: 'on_hold', RESOLVED: 'resolved', CLOSED: 'closed' }
const priorityMap: Record<string, TicketPriority> = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', URGENT: 'urgent' }
const API_BASE = import.meta.env.VITE_API_URL || ''

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [agents, setAgents] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchTicket() {
    if (!id) return
    try {
      const [tr, cr, ur] = await Promise.all([
        api<TicketDetail>(`/api/tickets/${id}`),
        api<Category[]>('/api/categories'),
        api<StaffUser[]>('/api/users'),
      ])
      setTicket(tr.data); setCategories(cr.data); setAgents(ur.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTicket() }, [id])

  if (loading) return <div className="max-w-6xl mx-auto py-12 text-center text-gray-500">Loading ticket...</div>
  if (!ticket) return (
    <div className="max-w-6xl mx-auto py-20 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">error</span>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <Link to="/admin/tickets" className="text-red-600 hover:underline">← Back to Tickets</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/admin/tickets"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back to Tickets
      </Link>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined text-base">close</span></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id.slice(0, 8).toUpperCase()}</h1>
            <StatusBadge status={statusMap[ticket.status] || 'open'} />
            <PriorityBadge priority={priorityMap[ticket.priority] || 'medium'} />
          </div>
          <div className="text-xs text-gray-400">Created {new Date(ticket.createdAt).toLocaleString()}</div>
        </div>
        <TicketControls
          ticketId={ticket.id} status={ticket.status}
          categoryId={ticket.category?.id || null} assignedAgentId={ticket.assignedAgent?.id || null}
          categories={categories} agents={agents}
          onUpdated={fetchTicket} onError={setError} />
      </div>

      <TicketInfoPanel
        guestName={ticket.guestName} guestEmail={ticket.guestEmail} guestPhone={ticket.guestPhone}
        assignedAgent={ticket.assignedAgent} priority={ticket.priority}
        createdAt={ticket.createdAt} updatedAt={ticket.updatedAt} resolvedAt={ticket.resolvedAt} />

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{ticket.title}</h2>
        <p className="text-sm text-gray-600 whitespace-pre-line">{ticket.description || 'No description provided.'}</p>
      </div>

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Attachments ({ticket.attachments.length})</h3>
          <div className="flex flex-wrap gap-4">
            {ticket.attachments.map((att) => {
              const isImg = att.fileType?.startsWith('image/')
              const size = att.fileSize >= 1_000_000 ? `${(att.fileSize / 1_000_000).toFixed(1)} MB` : `${(att.fileSize / 1_000).toFixed(0)} KB`
              return (
                <a key={att.id} href={`${API_BASE}${att.url}`} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-red-600">{isImg ? 'image' : 'description'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{att.fileName}</p>
                    <p className="text-[10px] text-gray-500">{size}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      <TicketTimeline comments={ticket.comments} />
      <TicketReplyForm ticketId={ticket.id} guestEmail={ticket.guestEmail} onReplied={fetchTicket} onError={setError} />
    </div>
  )
}
