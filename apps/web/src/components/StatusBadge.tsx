import type { TicketStatus } from '../types'

const statusConfig: Record<TicketStatus, { label: string; classes: string }> = {
  open:      { label: 'OPEN',      classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  pending:   { label: 'PENDING',   classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  on_hold:   { label: 'ON HOLD',   classes: 'bg-gray-100 text-gray-700 border-gray-300' },
  resolved:  { label: 'RESOLVED',  classes: 'bg-green-50 text-green-700 border-green-200' },
  closed:    { label: 'CLOSED',    classes: 'bg-gray-200 text-gray-500 border-gray-300' },
}

export default function StatusBadge({ status }: { status: TicketStatus }) {
  const c = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${c.classes}`}>
      {c.label}
    </span>
  )
}
