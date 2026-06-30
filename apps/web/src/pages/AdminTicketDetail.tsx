import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { api } from '../lib/api'
import type { TicketStatus, TicketPriority } from '../types'

interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
}

interface Comment {
  id: string
  authorType: 'AGENT' | 'GUEST'
  user: { name: string } | null
  guestName: string | null
  body: string
  isInternal: boolean
  createdAt: string
}

interface TicketDetail {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: { id: string; name: string } | null
  assignedAgent: { id: string; name: string; email: string } | null
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  publicToken: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  attachments: Attachment[]
  comments: Comment[]
}

const statusMap: Record<string, TicketStatus> = {
  OPEN: 'open', PENDING: 'pending', ON_HOLD: 'on_hold', RESOLVED: 'resolved', CLOSED: 'closed',
}
const priorityMap: Record<string, TicketPriority> = {
  LOW: 'low', MEDIUM: 'medium', HIGH: 'high', URGENT: 'urgent',
}

function TicketInfoPanel({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Customer</p>
        <p className="text-sm font-semibold text-gray-900">{ticket.guestName || '—'}</p>
        {ticket.guestEmail && <p className="text-xs text-gray-500">{ticket.guestEmail}</p>}
        {ticket.guestPhone && <p className="text-xs text-gray-500">{ticket.guestPhone}</p>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Assigned To</p>
        <p className="text-sm font-semibold text-gray-900">{ticket.assignedAgent?.name || 'Unassigned'}</p>
        {ticket.assignedAgent?.email && <p className="text-xs text-gray-500">{ticket.assignedAgent.email}</p>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Created</p>
        <p className="text-sm font-semibold text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
        <p className="text-sm font-semibold text-gray-900">{new Date(ticket.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}

function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null
  const formatSize = (bytes: number) =>
    bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : bytes >= 1_000 ? `${(bytes / 1_000).toFixed(0)} KB` : `${bytes} B`
  const isImage = (type: string) => type.startsWith('image/')
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Attachments ({attachments.length})</h3>
      <div className="flex flex-wrap gap-4">
        {attachments.map((att) => (
          <a
            key={att.id}
            href={`${API_BASE}${att.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined text-gray-400 group-hover:text-red-600 transition-colors">
              {isImage(att.fileType) ? 'image' : 'description'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{att.fileName}</p>
              <p className="text-[10px] text-gray-500">{formatSize(att.fileSize)}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function ActivityTimeline({ comments }: { comments: Comment[] }) {
  const visible = comments.filter((c) => !c.isInternal)
  if (visible.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400">
        No comments yet.
      </div>
    )
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Activity Timeline</h3>
      <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {visible.map((c) => {
          const authorName = c.authorType === 'AGENT' ? (c.user?.name || 'Staff') : (c.guestName || 'Guest')
          return (
            <div key={c.id} className="relative">
              <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 ${
                c.authorType === 'agent' ? 'bg-red-600 border-red-200' : 'bg-gray-400 border-gray-200'
              }`} />
              <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{authorName}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      c.authorType === 'AGENT' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {c.authorType === 'AGENT' ? 'AGENT' : 'GUEST'}
                    </span>
                    {c.isInternal && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                        Internal
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{c.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api<TicketDetail>(`/api/tickets/${id}`)
      .then((res) => setTicket(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-gray-500">Loading ticket...</div>
  }

  if (error || !ticket) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">error</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/admin/tickets" className="text-red-600 hover:underline">← Back to Tickets</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Tickets
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">Ticket #{ticket.id.slice(0, 8).toUpperCase()}</h1>
          <StatusBadge status={statusMap[ticket.status] || 'open'} />
          <PriorityBadge priority={priorityMap[ticket.priority] || 'medium'} />
          {ticket.category && (
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">{ticket.category.name}</span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <TicketInfoPanel ticket={ticket} />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{ticket.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{ticket.description || 'No description provided.'}</p>
        </div>
        <AttachmentGallery attachments={ticket.attachments} />
        <ActivityTimeline comments={ticket.comments} />
      </div>
    </div>
  )
}
