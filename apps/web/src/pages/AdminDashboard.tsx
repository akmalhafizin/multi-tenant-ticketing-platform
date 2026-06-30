const issueLog = [
  {
    date: '2023-10-24',
    ticketId: '#RCL-9921',
    category: 'HVAC Failure',
    status: 'In-Progress',
    statusTone: 'bg-amber-50 text-amber-700 border border-amber-100',
    activity: 'Technician dispatched by Mr. Tan',
  },
  {
    date: '2023-10-23',
    ticketId: '#RCL-9918',
    category: 'Electrical Leak',
    status: 'Completed',
    statusTone: 'bg-green-50 text-green-700 border border-green-100',
    activity: 'Marked as completed by Engr. Lee',
  },
  {
    date: '2023-10-23',
    ticketId: '#RCL-9915',
    category: 'Water Pipe Burst',
    status: 'Pending',
    statusTone: 'bg-red-50 text-red-700 border border-red-100',
    activity: 'Root cause analysis ongoing by Siti',
  },
  {
    date: '2023-10-22',
    ticketId: '#RCL-9899',
    category: 'Lighting Upgrade',
    status: 'Pending',
    statusTone: 'bg-red-50 text-red-700 border border-red-100',
    activity: 'Root cause analysis ongoing by Mr. Tan',
  },
]

function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Operations Dashboard
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 mt-2">
            Overseeing Facility Precision and Maintenance Integrity
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-white px-4 py-2 border border-gray-200 rounded">
          <span className="material-symbols-outlined text-gray-400">calendar_today</span>
          October 24, 2023 — Last Sync: 2m ago
        </div>
      </div>

      {/* Overview Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 border border-gray-200 rounded-lg group hover:border-red-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              analytics
            </span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">+12% vs LY</span>
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Issues Logged</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">1,284</div>
          <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-600 h-full w-[85%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg group hover:border-red-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              pending_actions
            </span>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">High Priority</span>
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Pending Verification</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">42</div>
          <div className="mt-4 flex gap-1 h-1.5">
            <div className="bg-red-600 h-full w-[30%] rounded-full"></div>
            <div className="bg-amber-400 h-full w-[40%] rounded-full"></div>
            <div className="bg-gray-200 h-full w-[30%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg group hover:border-red-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              check_circle
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">98% Success</span>
          </div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Resolved Maintenance</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">1,242</div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                MK
              </div>
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                +5
              </div>
            </div>
            <span className="text-xs text-gray-400">Team efficiency active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Issue Tracking Table */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Facility Issue Log</h3>
              <button className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                View History
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {issueLog.map((row) => (
                    <tr key={row.ticketId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.date}</td>
                      <td className="px-6 py-4 text-sm font-mono text-red-600">
                        <a className="hover:underline" href="#">
                          {row.ticketId}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${row.statusTone}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 italic">{row.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
