import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { extractSlugFromHost } from '../hooks/useTenant'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Comment {
  id: string
  authorType: 'AGENT' | 'GUEST'
  guestName: string | null
  body: string
  createdAt: string
}

interface TicketData {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  assignedTo: string | null
  guestName: string | null
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

const statusMap: Record<string, string> = {
  OPEN: 'open',
  PENDING: 'pending',
  ON_HOLD: 'on_hold',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
}

const priorityMap: Record<string, string> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

export default function TrackTicket() {
  const { publicToken } = useParams<{ publicToken: string }>()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Reply form
  const [replyName, setReplyName] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replying, setReplying] = useState(false)

  // Rating
  const [rating, setRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)

  useEffect(() => {
    if (!publicToken) return
    async function load() {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        const slug = extractSlugFromHost()
        if (slug) headers['X-Org-Slug'] = slug

        const res = await fetch(`${API_BASE}/api/tickets/track/${publicToken}`, { headers })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Ticket not found')
        setTicket(json.data)
        setReplyName(json.data.guestName || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [publicToken])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim()) return
    setReplying(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const slug = extractSlugFromHost()
      if (slug) headers['X-Org-Slug'] = slug

      const res = await fetch(`${API_BASE}/api/tickets/track/${publicToken}/reply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ guestName: replyName.trim(), body: replyBody.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send reply')

      // Reload ticket to show the new comment
      const reload = await fetch(`${API_BASE}/api/tickets/track/${publicToken}`, { headers })
      const reloadJson = await reload.json()
      setTicket(reloadJson.data)
      setReplyBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading ticket...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">search_off</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'No ticket matches this tracking link.'}</p>
        <Link to="/" className="text-red-600 hover:underline font-medium">Go to Home</Link>
      </div>
    )
  }

  const isClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
  const isResolved = ticket.status === 'RESOLVED'

  async function handleRate(star: number) {
    if (ratingSubmitted || ratingSubmitting) return
    setRatingSubmitting(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const slug = extractSlugFromHost()
      if (slug) headers['X-Org-Slug'] = slug

      const res = await fetch(`${API_BASE}/api/tickets/rate/${publicToken}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating: star }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit rating')
      setRating(star)
      setRatingSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating')
    } finally {
      setRatingSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Home
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
        <StatusBadge status={(statusMap[ticket.status] || 'open') as any} />
        <PriorityBadge priority={(priorityMap[ticket.priority] || 'medium') as any} />
      </div>

      {/* Info Grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Submitted By</p>
          <p className="text-sm font-semibold text-gray-900">{ticket.guestName || 'Anonymous'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Category</p>
          <p className="text-sm font-semibold text-gray-900">{ticket.category || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Assigned To</p>
          <p className="text-sm font-semibold text-gray-900">{ticket.assignedTo || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Submitted</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Description</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{ticket.description}</p>
        </div>
      )}

      {/* Comments Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
          Updates ({ticket.comments.length})
        </h2>

        {ticket.comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No updates yet.</p>
        ) : (
          <div className="space-y-4">
            {ticket.comments.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{c.guestName || 'Support Agent'}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      c.authorType === 'AGENT' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {c.authorType === 'AGENT' ? 'STAFF' : 'YOU'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Section — shown when ticket is RESOLVED */}
      {isResolved && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          {ratingSubmitted ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-red-600 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Thank You!</h2>
              <p className="text-sm text-gray-500">Your rating of {rating}/5 has been submitted.</p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Rate Your Experience</h2>
              <p className="text-sm text-gray-600 mb-4">Your ticket has been resolved. How would you rate the support you received?</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    disabled={ratingSubmitting}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      star <= rating ? 'text-red-600 scale-110' : 'text-gray-300 hover:text-red-400 hover:scale-105'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {star <= rating ? 'star' : 'star'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reply Form */}
      {!isClosed ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Add a Reply</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>
          )}
          <form onSubmit={handleReply} className="space-y-4">
            <input
              type="text"
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              placeholder="Your name"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
            />
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              required
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={replying || !replyBody.trim()}
                className="px-8 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
              >
                {replying ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500">This ticket is <strong>closed</strong> and no longer accepts replies.</p>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center mt-8">
        RCL Engineering & Facilities Sdn Bhd · SSM: 202501015082
      </p>
    </div>
  )
}
