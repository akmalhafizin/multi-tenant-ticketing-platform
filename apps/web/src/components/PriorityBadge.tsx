import type { TicketPriority } from '../types'

const priorityConfig: Record<TicketPriority, { label: string; classes: string }> = {
  low:    { label: 'LOW',    classes: 'bg-gray-100 text-gray-600' },
  medium: { label: 'MEDIUM', classes: 'bg-blue-100 text-blue-700' },
  high:   { label: 'HIGH',   classes: 'bg-orange-100 text-orange-700' },
  urgent:  { label: 'URGENT',  classes: 'bg-red-100 text-red-700' },
}

export default function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const c = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.classes}`}>
      {c.label}
    </span>
  )
}
