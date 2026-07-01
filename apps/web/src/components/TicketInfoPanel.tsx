import PriorityBadge from './PriorityBadge'
import type { TicketPriority } from '../types'

interface Props {
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  assignedAgent: { id: string; name: string; email: string } | null
  priority: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  slaHours?: number | null
}

const priorityMap: Record<string, TicketPriority> = {
  LOW: 'low', MEDIUM: 'medium', HIGH: 'high', URGENT: 'urgent',
}

export default function TicketInfoPanel({ guestName, guestEmail, guestPhone, assignedAgent, priority, createdAt, updatedAt, resolvedAt, slaHours }: Props) {
  const resolutionTime = resolvedAt
    ? Math.round((new Date(resolvedAt).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
    : null
  const ageHrs = Math.round((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
  const slaPct = (slaHours || 24) > 0 ? Math.min(100, Math.round((ageHrs / (slaHours || 24)) * 100)) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Customer</p>
        <p className="text-sm font-semibold text-gray-900">{guestName || '—'}</p>
        {guestEmail && <p className="text-xs text-gray-500">{guestEmail}</p>}
        {guestPhone && <p className="text-xs text-gray-500">{guestPhone}</p>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Assigned To</p>
        <p className="text-sm font-semibold text-gray-900">{assignedAgent?.name || 'Unassigned'}</p>
        {assignedAgent?.email && <p className="text-xs text-gray-500">{assignedAgent.email}</p>}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Priority</p>
        <PriorityBadge priority={priorityMap[priority] || 'medium'} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Resolution Time</p>
        {resolutionTime !== null ? (
          <p className="text-sm font-semibold text-gray-900">{resolutionTime}h</p>
        ) : (
          <div>
            <p className="text-sm font-semibold text-gray-900">{ageHrs}h elapsed</p>
            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
              <div className={`h-full rounded-full ${slaPct > 100 ? 'bg-red-500' : slaPct > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(slaPct, 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
