import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import type { Ticket, Comment, Attachment, AuthorType, TicketStatus } from '../types'

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockTicket: Ticket = {
  id: 'RCL-9281',
  date: 'Oct 24, 2023',
  category: 'HVAC Maintenance',
  status: 'pending',
  priority: 'high',
  title: 'HVAC Failure — Building B, Level 2',
  description:
    'Air conditioning unit B-204 is leaking water and making loud noises. ' +
    'The unit has been running for over 8 hours continuously and the condensation ' +
    'drain line appears to be clogged. Water is pooling on the floor near the ' +
    'south-west corner. Urgent attention required to prevent damage to ' +
    'nearby electrical panels and server equipment.',
  guestName: 'John Doe',
  guestEmail: 'john.doe@client.com',
  guestPhone: '+60 12-345 6789',
  assignedTo: 'Ahmad Zaki',
  createdAt: 'Oct 24, 2023 10:00',
  updatedAt: 'Oct 24, 2023 14:30',
  attachments: [
    { id: 'att-1', fileName: 'leak-photo-1.jpg', fileType: 'image/jpeg', fileSize: 2_400_000, url: '#' },
    { id: 'att-2', fileName: 'unit-serial-number.jpg', fileType: 'image/jpeg', fileSize: 1_800_000, url: '#' },
    { id: 'att-3', fileName: 'floor-plan-b2.pdf', fileType: 'application/pdf', fileSize: 4_200_000, url: '#' },
  ],
  comments: [
    {
      id: 'c1',
      author: 'Ahmad Zaki',
      authorType: 'agent',
      body: 'Dispatched technician to site. Estimated arrival in 30 minutes.',
      isInternal: false,
      createdAt: 'Oct 24, 2023 10:45',
    },
    {
      id: 'c2',
      author: 'Siti Rahmah',
      authorType: 'agent',
      body: 'Spoke with building manager — they have isolated the electrical panel nearby as a precaution.',
      isInternal: true,
      createdAt: 'Oct 24, 2023 11:15',
    },
    {
      id: 'c3',
      author: 'John Doe',
      authorType: 'guest',
      body: 'Thank you for the quick response. The technician arrived and has identified the issue as a blocked drain line.',
      isInternal: false,
      createdAt: 'Oct 24, 2023 12:00',
    },
    {
      id: 'c4',
      author: 'Ahmad Zaki',
      authorType: 'agent',
      body: 'Replacement part ordered. ETA for installation is tomorrow morning. Ticket moved to ON HOLD pending part arrival.',
      isInternal: false,
      createdAt: 'Oct 24, 2023 14:30',
    },
  ],
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function TicketInfoPanel({ ticket }: { ticket: Ticket }) {
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
        <p className="text-sm font-semibold text-gray-900">{ticket.assignedTo || 'Unassigned'}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Created</p>
        <p className="text-sm font-semibold text-gray-900">{ticket.createdAt}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
        <p className="text-sm font-semibold text-gray-900">{ticket.updatedAt}</p>
      </div>
    </div>
  )
}

function TicketDescriptionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
    </div>
  )
}

function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
    return `${bytes} B`
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Attachments</h3>
      <div className="flex flex-wrap gap-4">
        {attachments.map((att) => (
          <a
            key={att.id}
            href={att.url}
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
  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Activity Timeline</h3>
      <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {sorted.map((comment) => (
          <div key={comment.id} className="relative">
            {/* Dot */}
            <div
              className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 ${
                comment.authorType === 'agent'
                  ? 'bg-red-600 border-red-200'
                  : 'bg-gray-400 border-gray-200'
              }`}
            />
            {/* Content */}
            <div className={`p-4 rounded-lg border ${comment.isInternal ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    comment.authorType === 'agent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {comment.authorType === 'agent' ? 'AGENT' : 'GUEST'}
                  </span>
                  {comment.isInternal && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                      Internal
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{comment.createdAt}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReplyForm({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to API
    console.log('Reply submitted:', { ticketId, reply, isInternal, newStatus })
    setReply('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Add a Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply here..."
          rows={4}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none resize-none text-sm"
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
              />
              <span className="text-xs font-medium text-gray-600">Internal note (hidden from guest)</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 focus:ring-1 focus:ring-red-600 outline-none"
            >
              <option value="">Keep current status</option>
              <option value="open">Set → OPEN</option>
              <option value="pending">Set → PENDING</option>
              <option value="on_hold">Set → ON HOLD</option>
              <option value="resolved">Set → RESOLVED</option>
              <option value="closed">Set → CLOSED</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!reply.trim()}
            className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Reply
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>()
  // In real app: fetch ticket by id from API
  const ticket = mockTicket

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb Nav */}
      <Link
        to="/admin/tickets"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Tickets
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
            {ticket.category}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <span className="material-symbols-outlined text-sm">print</span>
            Print
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6">
        <TicketInfoPanel ticket={ticket} />
        <TicketDescriptionCard title={ticket.title} description={ticket.description} />
        <AttachmentGallery attachments={ticket.attachments} />
        <ActivityTimeline comments={ticket.comments} />
        <ReplyForm ticketId={ticket.id} />
      </div>
    </div>
  )
}
