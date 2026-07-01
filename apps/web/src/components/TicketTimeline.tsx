interface Comment {
  id: string
  authorType: 'AGENT' | 'GUEST'
  user: { id: string; name: string } | null
  guestName: string | null
  body: string
  isInternal: boolean
  createdAt: string
}

interface Props {
  comments: Comment[]
}

export default function TicketTimeline({ comments }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Activity ({comments.length})</h3>
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
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
  )
}
