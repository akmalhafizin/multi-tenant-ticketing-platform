import { useState } from 'react'
import { Link } from 'react-router-dom'

type Status = 'pending' | 'in-progress' | 'completed'

interface Ticket {
  id: string
  date: string
  category: string
  status: Status
  activityLabel: string
  activityName: string
}

const statusStyles: Record<Status, string> = {
  pending: 'bg-red-50 border-red-200 text-red-700 focus:ring-red-500',
  'in-progress': 'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-yellow-500',
  completed: 'bg-green-50 border-green-200 text-green-700 focus:ring-green-500',
}

const initialTickets: Ticket[] = [
  {
    id: '#RCL-9281',
    date: 'Oct 24, 2023',
    category: 'HVAC Maintenance',
    status: 'pending',
    activityLabel: 'Assigned to',
    activityName: 'Ahmad Zaki',
  },
  {
    id: '#RCL-9280',
    date: 'Oct 24, 2023',
    category: 'Electrical Systems',
    status: 'in-progress',
    activityLabel: 'Technician onsite',
    activityName: 'Siva Kumar',
  },
  {
    id: '#RCL-9279',
    date: 'Oct 23, 2023',
    category: 'Fire Safety',
    status: 'completed',
    activityLabel: 'Site inspection closed by',
    activityName: 'Lee WS',
  },
  {
    id: '#RCL-9278',
    date: 'Oct 23, 2023',
    category: 'Civil Works',
    status: 'pending',
    activityLabel: 'Reported by',
    activityName: 'Facility Mgr',
  },
  {
    id: '#RCL-9277',
    date: 'Oct 23, 2023',
    category: 'Energy Audit',
    status: 'in-progress',
    activityLabel: '',
    activityName: 'Data collection in progress',
  },
]

const categoryDistribution = [
  { label: 'Mechanical & HVAC', percent: 45, count: 578, opacity: 'opacity-100' },
  { label: 'Electrical & Lighting', percent: 30, count: 385, opacity: 'opacity-80' },
  { label: 'Fire Protection', percent: 15, count: 192, opacity: 'opacity-60' },
  { label: 'Civil & General Works', percent: 10, count: 129, opacity: 'opacity-40' },
]

function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)

  function handleStatusChange(ticketId: string, newStatus: Status) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-gray-400">assignment</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">1,284</p>
          <p className="text-sm text-gray-500">Total Tickets</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2 border-l-4 border-l-red-600">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-red-600">priority_high</span>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Action Required</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-500">Pending Action</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-gray-500">engineering</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Field</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">18</p>
          <p className="text-sm text-gray-500">Active Technicians</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2 border-l-4 border-l-green-600">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Success</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">142</p>
          <p className="text-sm text-gray-500">Completed Today</p>
        </div>
      </div>

      {/* Ticket Table Container */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-semibold text-gray-900">Recent Service Tickets</h3>
          <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-sm mr-2">filter_list</span> Filter
            </button>
            <Link
              to="/admin/tickets/create"
              className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm mr-2">add</span> Create Ticket
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Latest Activity</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/tickets/${ticket.id.replace('#RCL-', 'RCL-')}`}
                      className="text-red-600 font-bold hover:underline"
                    >
                      {ticket.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-base">{ticket.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-full min-w-[140px]">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as Status)}
                        className={`appearance-none w-full border py-1.5 px-3 pr-8 rounded text-xs font-bold focus:outline-none focus:ring-2 cursor-pointer ${statusStyles[ticket.status]}`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="in-progress">IN-PROGRESS</option>
                        <option value="completed">COMPLETED</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {ticket.activityLabel ? (
                      <>
                        {ticket.activityLabel}: <span className="font-semibold text-gray-700">{ticket.activityName}</span>
                      </>
                    ) : (
                      ticket.activityName
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/tickets/${ticket.id.replace('#RCL-', 'RCL-')}`}
                      className="text-red-600 hover:text-red-700 font-bold text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Showing 5 of 1,284 tickets</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 text-xs font-bold rounded hover:bg-gray-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 text-xs font-bold rounded hover:bg-gray-50">3</button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Service Category Distribution (Full Width) */}
      <section className="mt-10">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-semibold text-gray-900">Service Category Distribution</h4>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="material-symbols-outlined">schedule</span>
              Last 30 Days
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="space-y-6 lg:col-span-2">
              {categoryDistribution.map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    <span>{cat.label}</span>
                    <span className={`text-red-600 ${cat.opacity}`}>
                      {cat.percent}% ({cat.count} Tickets)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-red-600 rounded-full transition-all duration-500 ${cat.opacity}`}
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">pie_chart</span>
              <p className="text-sm font-semibold text-gray-700">Analytics Summary</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Mechanical and HVAC services remain the highest demand category this month,
                showing a 12% increase from the previous quarter.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminTickets
