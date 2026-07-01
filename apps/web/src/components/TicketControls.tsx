import { api } from '../lib/api'

interface Props {
  ticketId: string
  status: string
  categoryId: string | null
  assignedAgentId: string | null
  categories: { id: string; name: string }[]
  agents: { id: string; name: string | null; email: string }[]
  onUpdated: () => void
  onError: (msg: string) => void
}

const STATUS_OPTIONS = ['OPEN', 'PENDING', 'ON_HOLD', 'RESOLVED', 'CLOSED']

export default function TicketControls({ ticketId, status, categoryId, assignedAgentId, categories, agents, onUpdated, onError }: Props) {
  async function handleUpdate(fields: Record<string, any>) {
    try {
      await api(`/api/tickets/${ticketId}`, { method: 'PATCH', body: JSON.stringify(fields) })
      onUpdated()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Status</label>
        <select value={status} onChange={(e) => handleUpdate({ status: e.target.value })}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-600 outline-none bg-white">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Category</label>
        <select value={categoryId || ''} onChange={(e) => handleUpdate({ categoryId: e.target.value || null })}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-600 outline-none bg-white">
          <option value="">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">Assigned To</label>
        <select value={assignedAgentId || ''} onChange={(e) => handleUpdate({ assignedAgentId: e.target.value || null })}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-red-600 outline-none bg-white">
          <option value="">Unassigned</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
        </select>
      </div>
    </div>
  )
}
