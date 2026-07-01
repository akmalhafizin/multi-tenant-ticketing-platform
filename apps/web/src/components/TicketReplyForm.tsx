import { useState } from 'react'
import { api } from '../lib/api'

interface Props {
  ticketId: string
  guestEmail: string | null
  onReplied: () => void
  onError: (msg: string) => void
}

export default function TicketReplyForm({ ticketId, guestEmail, onReplied, onError }: Props) {
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [notify, setNotify] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const res = await api<{ comment: any; notification: any }>(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body, isInternal: internal, notifyGuest: notify }),
      })
      setBody(''); setInternal(false)
      if (res.data.notification) {
        setSuccess('Reply sent — guest notified via email')
      } else {
        setSuccess('Reply added')
      }
      setTimeout(() => setSuccess(''), 3000)
      onReplied()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Add a Reply</h3>
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Type your reply..." rows={4}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm resize-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600" />
              <span className="text-xs font-medium text-gray-600">Internal note</span>
            </label>
            {!!guestEmail && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600" />
                <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">mail</span> Notify guest
                </span>
              </label>
            )}
          </div>
          <button type="submit" disabled={submitting || !body.trim()}
            className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors">
            {submitting ? 'Sending...' : 'Submit Reply'}
          </button>
        </div>
      </form>
      {!guestEmail && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">info</span>
          No guest email — "Notify guest" hidden.
        </p>
      )}
    </div>
  )
}
