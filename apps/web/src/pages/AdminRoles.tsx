import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface RolePermissions {
  pages: Record<string, boolean>
  tickets: Record<string, boolean>
}

interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: RolePermissions
}

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  tickets: 'Ticket Management',
  categories: 'Categories',
  users: 'Staff Management',
  roles: 'Role Management',
  settings: 'Organization Settings',
  reports: 'Reports',
}

const TICKET_LABELS: Record<string, string> = {
  view: 'View Tickets',
  create: 'Create Tickets',
  assign: 'Assign to Agents',
  close: 'Close / Resolve',
  delete: 'Delete Tickets',
  reply: 'Reply to Tickets',
}

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPerms, setEditPerms] = useState<RolePermissions | null>(null)

  // Create state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPerms, setNewPerms] = useState<RolePermissions>({
    pages: { dashboard: true, tickets: true, categories: false, users: false, roles: false, settings: false, reports: false },
    tickets: { view: true, create: true, assign: false, close: false, delete: false, reply: true },
  })

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchRoles = async () => {
    try {
      const res = await api<Role[]>('/api/roles')
      setRoles(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, [])

  function showSuccess(msg: string) { setSuccessMsg(msg); setError(''); }
  function togglePerm(perms: RolePermissions, section: 'pages' | 'tickets', key: string): RolePermissions {
    return {
      ...perms,
      [section]: { ...perms[section], [key]: !perms[section][key] },
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await api('/api/roles', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), permissions: newPerms }),
      })
      setShowCreate(false); setNewName(''); setNewDesc('')
      resetNewPerms()
      showSuccess('Role created')
      await fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
    }
  }

  function resetNewPerms() {
    setNewPerms({
      pages: { dashboard: true, tickets: true, categories: false, users: false, roles: false, settings: false, reports: false },
      tickets: { view: true, create: true, assign: false, close: false, delete: false, reply: true },
    })
  }

  function startEdit(role: Role) {
    setEditingId(role.id)
    setEditName(role.name)
    setEditDesc(role.description || '')
    setEditPerms({ ...role.permissions, pages: { ...role.permissions.pages }, tickets: { ...role.permissions.tickets } })
    setError('')
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim() || !editPerms) return
    try {
      await api(`/api/roles/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim(), permissions: editPerms }),
      })
      setEditingId(null)
      showSuccess('Role updated')
      await fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  async function handleDelete(id: string) {
    try {
      await api(`/api/roles/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      showSuccess('Role deleted')
      await fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-gray-500">Loading roles...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">Role Management</h1>
          <p className="text-lg leading-relaxed text-gray-600 mt-2">
            Define custom roles with granular page and ticket permissions.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError('') }}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Role
        </button>
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
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-500 hover:text-green-700">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">New Role</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Role name" required
                className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm" />
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
                className="h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm" />
            </div>
            <PermissionEditor perms={newPerms} onChange={setNewPerms} toggle={togglePerm} />
            <div className="flex gap-2">
              <button type="submit" className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-red-700">Create</button>
              <button type="button" onClick={() => { setShowCreate(false); resetNewPerms() }} className="px-6 py-2.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Page Access</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Ticket Actions</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => {
                const isEditing = editingId === role.id
                const perms = isEditing ? editPerms! : role.permissions

                return (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-600 outline-none" />
                          <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-600 outline-none" placeholder="Description" />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{role.name}</p>
                          {role.description && <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role.isSystem ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded border border-purple-200">SYSTEM</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200">CUSTOM</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <PermissionCheckboxes
                          section="pages"
                          labels={PAGE_LABELS}
                          perms={perms.pages}
                          onToggle={(key) => setEditPerms(togglePerm(perms, 'pages', key))}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(perms.pages || {}).map(([k, v]) =>
                            v ? <span key={k} className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-200">{PAGE_LABELS[k] || k}</span> : null
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <PermissionCheckboxes
                          section="tickets"
                          labels={TICKET_LABELS}
                          perms={perms.tickets}
                          onToggle={(key) => setEditPerms(togglePerm(perms, 'tickets', key))}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(perms.tickets || {}).map(([k, v]) =>
                            v ? <span key={k} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">{TICKET_LABELS[k] || k}</span> : null
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                            <span className="material-symbols-outlined text-base">check</span>
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(role)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Edit">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          {!role.isSystem && (
                            deleteId === role.id ? (
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-gray-500 mr-1">Delete?</span>
                                <button onClick={() => handleDelete(role.id)} className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded">Yes</button>
                                <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded">No</button>
                              </div>
                            ) : (
                              <button onClick={() => { setDeleteId(role.id); setError('') }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-500">
          {roles.length} role{roles.length !== 1 ? 's' : ''} · System roles cannot be deleted
        </div>
      </div>
    </div>
  )
}

function PermissionCheckboxes({ section, labels, perms, onToggle }: {
  section: string
  labels: Record<string, string>
  perms: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  return (
    <div className="space-y-1">
      {Object.keys(labels).map((key) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={perms[key] || false}
            onChange={() => onToggle(key)}
            className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-600"
          />
          <span className="text-[11px] text-gray-700 whitespace-nowrap">{labels[key]}</span>
        </label>
      ))}
    </div>
  )
}

function PermissionEditor({ perms, onChange, toggle }: {
  perms: RolePermissions
  onChange: (p: RolePermissions) => void
  toggle: (perms: RolePermissions, section: 'pages' | 'tickets', key: string) => RolePermissions
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Page Access</p>
        <div className="space-y-1.5">
          {Object.entries(PAGE_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={perms.pages[key] || false}
                onChange={() => onChange(toggle(perms, 'pages', key))}
                className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-600" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Ticket Actions</p>
        <div className="space-y-1.5">
          {Object.entries(TICKET_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={perms.tickets[key] || false}
                onChange={() => onChange(toggle(perms, 'tickets', key))}
                className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-600" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
