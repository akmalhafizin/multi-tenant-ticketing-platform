import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface Category {
  id: string
  name: string
}

interface StaffUser {
  id: string
  name: string | null
  email: string
  role: string
}

interface FormData {
  title: string
  description: string
  categoryId: string
  priority: string
  status: string
  assignedAgentId: string
  guestName: string
  guestEmail: string
  guestPhone: string
}

const initialForm: FormData = {
  title: '',
  description: '',
  categoryId: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  assignedAgentId: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
}

export default function AdminCreateTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(initialForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [agents, setAgents] = useState<StaffUser[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [catRes, userRes] = await Promise.all([
          api<Category[]>('/api/categories'),
          api<StaffUser[]>('/api/users'),
        ])
        setCategories(catRes.data)
        // Only show AGENT and ADMIN users in the assignee dropdown
        setAgents(userRes.data.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await api<{ id: string; title: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId || undefined,
          priority: form.priority,
          status: form.status,
          assignedAgentId: form.assignedAgentId || undefined,
          guestName: form.guestName || undefined,
          guestEmail: form.guestEmail || undefined,
          guestPhone: form.guestPhone || undefined,
        }),
      })

      navigate(`/admin/tickets/${res.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-gray-500">
        Loading form...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
          Create Ticket
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 mt-2">
          Create a new service ticket from the staff dashboard.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Ticket Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">assignment</span>
            Ticket Information
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue..."
              rows={5}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Category</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm appearance-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm appearance-none bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm appearance-none bg-white"
              >
                <option value="OPEN">Open</option>
                <option value="PENDING">Pending</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Assignment */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">engineering</span>
            Assignment
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Assign To</label>
            <select
              name="assignedAgentId"
              value={form.assignedAgentId}
              onChange={handleChange}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm appearance-none bg-white"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.email} ({agent.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Guest / Reporter Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">person</span>
            Reporter Details <span className="text-xs font-normal text-gray-400">(optional)</span>
          </h2>
          <p className="text-xs text-gray-500 -mt-4">
            Fill this in if the ticket is being created on behalf of a guest/customer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Name</label>
              <input
                name="guestName"
                type="text"
                value={form.guestName}
                onChange={handleChange}
                placeholder="Guest name"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Email</label>
              <input
                name="guestEmail"
                type="email"
                value={form.guestEmail}
                onChange={handleChange}
                placeholder="guest@example.com"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Phone</label>
              <input
                name="guestPhone"
                type="tel"
                value={form.guestPhone}
                onChange={handleChange}
                placeholder="+60 12-345 6789"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pb-12">
          <button
            type="button"
            onClick={() => navigate('/admin/tickets')}
            className="px-6 py-3 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !form.title.trim()}
            className="px-8 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">add</span>
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
