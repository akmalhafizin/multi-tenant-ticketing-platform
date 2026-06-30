import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import type { TicketStatus, TicketPriority } from '../types'

interface Attachment {
  id: string; fileName: string; fileType: string; fileSize: number; url: string
}
interface Comment {
  id: string; authorType: 'AGENT' | 'GUEST'
  user: { id: string; name: string } | null
  guestName: string | null
  body: string; isInternal: boolean; createdAt: string
}
interface Category { id: string; name: string }
interface StaffUser { id: string; name: string | null; email: string; role: string }
interface TicketDetail {
  id: string; title: string; description: string | null; status: string; priority: string
  category: Category | null; assignedAgent: { id: string; name: string; email: string } | null
  guestName: string | null; guestEmail: string | null; guestPhone: string | null
  publicToken: string; createdAt: string; updatedAt: string; resolvedAt: string | null
  attachments: Attachment[]; comments: Comment[]
}

const STATUS_OPTIONS = ['OPEN', 'PENDING', 'ON_HOLD', 'RESOLVED', 'CLOSED']
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
  const [successMsg, setSuccessMsg] = useState('')

  // Comment form
  const [commentBody, setCommentBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [notifyGuest, setNotifyGuest] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  async function fetchTicket() {
    if (!id) return
    try {
      const [ticketRes, catRes, userRes] = await Promise.all([
        api<TicketDetail>(`/api/tickets/${id}`),
        api<Category[]>('/api/categories'),
        api<StaffUser[]>('/api/users'),
      ])
      setTicket(ticketRes.data)
      setCategories(catRes.data)
      setAgents(userRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTicket() }, [id])

  async function handleUpdate(fields: Record<string, any>) {
    if (!id) return
    try {
      await api(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fields),
      })
      showSuccess('Updated')
      await fetchTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentBody.trim() || !id) return
    setSubmittingComment(true)
    try {
      const res = await api<{ comment: Comment; notification: any }>(`/api/tickets/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody, isInternal, notifyGuest }),
      })
      setCommentBody(''); setIsInternal(false)
      if (res.data.notification) {
        showSuccess('Reply sent' + (res.data.notification ? ' — guest notified via email' : ''))
      } else {
        showSuccess('Reply added')
      }
      await fetchTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  function showSuccess(msg: string) { setSuccessMsg(msg); setError(''); setTimeout(() => setSuccessMsg(''), 4000) }

  // ─── Render ──────────────────────────────────────────────────────

  if (loading) return <div className="max-w-6xl mx-auto py-12 text-center text-gray-500">Loading ticket...</div>
  if (!ticket) return (
    <div className="max-w-6xl mx-auto py-20 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">error</span>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <Link to="/admin/tickets" className="text-red-600 hover:underline">← Back to Tickets</Link>
    </div>
  )

  const canAssign = true // Will be permission-checked later against role
  const hasGuestEmail = !!ticket.guestEmail

  // Compute resolution time and SLA
  const resolutionTime = ticket.resolvedAt
    ? Math.round((new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60))
    : null
  const currentAge = Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60))
  const slaHoursSetting = 24 // fallback, will come from org settings later
  const slaPercent = slaHoursSetting > 0 ? Math.min(100, Math.round((currentAge / slaHoursSetting) * 100)) : 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back */}
      <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Tickets
      </Link>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500"><span className="material-symbols-outlined text-base">close</span></button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg">{successMsg}</div>
      )}

      {/* ─── Header: ID + Status + Priority + Category ─────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id.slice(0, 8).toUpperCase()}</h1>
            <StatusBadge status={statusMap[ticket.status] || 'open'} />
            <PriorityBadge priority={priorityMap[ticket.priority] || 'medium'} />
          </div>
          <div className="text-xs text-gray-400">
            Created {new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Status */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Status</label>
            <select
              value={ticket.status}
              onChange={(e) => handleUpdate({ status: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-600 outline-none bg-white"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Category</label>
            <select
              value={ticket.category?.id || ''}
              onChange={(e) => handleUpdate({ categoryId: e.target.value || null })}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-600 outline-none bg-white"
            >
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {/* Assigned Agent */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Assigned To</label>
            <select
              value={ticket.assignedAgent?.id || ''}
              onChange={(e) => handleUpdate({ assignedAgentId: e.target.value || null })}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-600 outline-none bg-white"
            >
              <option value="">Unassigned</option>
              {agents.filter((u) => ['AGENT', 'ADMIN', 'OWNER'].includes(u.role)).map((a) => (
                <option key={a.id} value={a.id}>{a.name || a.email}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Info Panel ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Priority</p>
          <PriorityBadge priority={priorityMap[ticket.priority] || 'medium'} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Resolution Time</p>
          {resolutionTime !== null ? (
            <p className="text-sm font-semibold text-gray-900">{resolutionTime}h</p>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-900">{currentAge}h elapsed</p>
              <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                <div className={`h-full rounded-full ${slaPercent > 100 ? 'bg-red-500' : slaPercent > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(slaPercent, 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Description ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{ticket.title}</h2>
        <p className="text-sm text-gray-600 whitespace-pre-line">{ticket.description || 'No description provided.'}</p>
      </div>

      {/* ─── Attachments ───────────────────────────────────────── */}
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

      {/* ─── Activity Timeline ─────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Activity ({ticket.comments.length})</h3>
        {ticket.comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {ticket.comments.map((c) => {
              const name = c.authorType === 'AGENT' ? (c.user?.name || 'Staff') : (c.guestName || 'Guest')
              return (
                <div key={c.id} className={`p-4 rounded-lg border ${c.isInternal ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{name}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${c.authorType === 'AGENT' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                        {c.authorType === 'AGENT' ? 'AGENT' : 'GUEST'}
                      </span>
                      {c.isInternal && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">INTERNAL</span>}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{c.body}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Reply Form ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Add a Reply</h3>
        <form onSubmit={handleAddComment} className="space-y-4">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Type your reply..."
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm resize-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600" />
                <span className="text-xs font-medium text-gray-600">Internal note (hidden from guest)</span>
              </label>
              {hasGuestEmail && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notifyGuest} onChange={(e) => setNotifyGuest(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600" />
                  <span className="text-xs font-medium text-gray-600">
                    <span className="material-symbols-outlined text-sm align-text-bottom">mail</span> Notify guest via email
                  </span>
                </label>
              )}
            </div>
            <button type="submit" disabled={submittingComment || !commentBody.trim()}
              className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors">
              {submittingComment ? 'Sending...' : 'Submit Reply'}
            </button>
          </div>
        </form>
        {!hasGuestEmail && (
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            No guest email on this ticket — "Notify guest" option is hidden.
          </p>
        )}
      </div>
    </div>
  )
}
