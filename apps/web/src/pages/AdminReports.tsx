import StatCard from '../components/StatCard'

// ─── Mock Data ──────────────────────────────────────────────────────────────

const categoryData = [
  { label: 'Mechanical & HVAC', percent: 45, count: 578, color: 'bg-red-600' },
  { label: 'Electrical & Lighting', percent: 30, count: 385, color: 'bg-orange-500' },
  { label: 'Fire Protection', percent: 15, count: 192, color: 'bg-amber-400' },
  { label: 'Civil & General Works', percent: 10, count: 129, color: 'bg-gray-400' },
]

const statusData = [
  { label: 'Open', percent: 18, count: 231, color: 'bg-blue-500' },
  { label: 'In Progress', percent: 22, count: 282, color: 'bg-amber-500' },
  { label: 'Resolved', percent: 45, count: 578, color: 'bg-green-500' },
  { label: 'Closed', percent: 15, count: 193, color: 'bg-gray-500' },
]

const recentActivity = [
  { id: '1', ticketId: '#RCL-9921', action: 'Status changed to Completed', by: 'Engr. Lee', time: '2h ago' },
  { id: '2', ticketId: '#RCL-9918', action: 'Priority raised to HIGH', by: 'Mr. Tan', time: '4h ago' },
  { id: '3', ticketId: '#RCL-9915', action: 'Assigned to Siti Rahmah', by: 'Admin', time: '6h ago' },
  { id: '4', ticketId: '#RCL-9899', action: 'New ticket created', by: 'Guest', time: '8h ago' },
  { id: '5', ticketId: '#RCL-9895', action: 'Comment added', by: 'Ahmad Zaki', time: '12h ago' },
  { id: '6', ticketId: '#RCL-9880', action: 'Attachment uploaded', by: 'Guest', time: '1d ago' },
]

// ─── Sub-Components ─────────────────────────────────────────────────────────

function CategoryBarChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900">Tickets by Category</h3>
        <span className="text-xs text-gray-400">Last 30 days</span>
      </div>
      <div className="space-y-5">
        {categoryData.map((cat) => (
          <div key={cat.label}>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
              <span>{cat.label}</span>
              <span className="text-gray-900 font-semibold">{cat.percent}% ({cat.count.toLocaleString()})</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                style={{ width: `${cat.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusDistribution() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900">Status Distribution</h3>
        <span className="text-xs text-gray-400">Current</span>
      </div>
      <div className="space-y-4">
        {statusData.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${s.color}`} />
            <span className="text-sm text-gray-600 flex-1">{s.label}</span>
            <span className="text-sm font-semibold text-gray-900">{s.percent}%</span>
            <span className="text-xs text-gray-400 w-12 text-right">{s.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
      {/* Mini donut visual */}
      <div className="mt-6 flex items-center justify-center gap-1">
        {statusData.map((s) => (
          <div
            key={s.label}
            className="h-2 rounded-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${s.percent}%`, backgroundColor: s.color.replace('bg-', '') }}
          />
        ))}
      </div>
    </div>
  )
}

function ActivityFeed() {
  const getIcon = (action: string): string => {
    if (action.includes('Completed')) return 'check_circle'
    if (action.includes('raised') || action.includes('HIGH')) return 'priority_high'
    if (action.includes('Assigned')) return 'assignment'
    if (action.includes('created')) return 'add_circle'
    if (action.includes('Comment')) return 'chat'
    if (action.includes('Attachment') || action.includes('uploaded')) return 'attach_file'
    return 'circle'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
        <button className="text-xs font-medium text-red-600 hover:underline">View All</button>
      </div>
      <div className="space-y-0 divide-y divide-gray-100">
        {recentActivity.map((item) => (
          <div key={item.id} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
            <span className="material-symbols-outlined text-gray-400 text-xl mt-0.5">
              {getIcon(item.action)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-red-600">{item.ticketId}</span>{' '}
                — {item.action}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                by {item.by} · {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminReports() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">Reports</h1>
        <p className="text-lg leading-relaxed text-gray-600 mt-2">
          Facility performance and maintenance analytics.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="analytics"
          label="Total Tickets"
          value="1,284"
          sub="+12% vs last month"
          accent="red"
        />
        <StatCard
          icon="schedule"
          label="Avg Resolution"
          value="3.2 days"
          sub="8% improvement"
          accent="green"
        />
        <StatCard
          icon="pending_actions"
          label="Open Tickets"
          value="47"
          sub="5 urgent"
          accent="amber"
        />
        <StatCard
          icon="star"
          label="CSAT Score"
          value="4.8"
          sub="92% satisfaction"
          accent="green"
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryBarChart />
        </div>
        <StatusDistribution />
        <ActivityFeed />
      </div>
    </div>
  )
}
