import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

interface OrgUser {
  id: string
  email: string
  name: string | null
  role: 'OWNER' | 'ADMIN' | 'AGENT'
  createdAt: string
}

const roleConfig: Record<string, { label: string; classes: string }> = {
  OWNER: { label: 'OWNER', classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  ADMIN: { label: 'ADMIN', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  AGENT: { label: 'AGENT', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<OrgUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Role change state
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await api<OrgUser[]>('/api/users')
      setUsers(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  async function handleRoleChange(userId: string) {
    if (!selectedRole) return
    try {
      await api(`/api/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: selectedRole }),
      })
      setChangingRole(null)
      setSelectedRole('')
      setSuccessMsg('Role updated successfully')
      setError('')
      setTimeout(() => setSuccessMsg(''), 3000)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  async function handleDelete(userId: string) {
    try {
      await api(`/api/users/${userId}`, { method: 'DELETE' })
      setDeleteId(null)
      setSuccessMsg('User removed successfully')
      setError('')
      setTimeout(() => setSuccessMsg(''), 3000)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  const isOwner = currentUser?.role === 'OWNER'

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center text-gray-500">
        Loading users...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
          Staff Management
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 mt-2">
          Manage users and roles within your organization.
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

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                const c = roleConfig[u.role]
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-gray-50 transition-colors ${isSelf ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">
                            {u.name || '—'}
                          </span>
                          {isSelf && (
                            <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      {changingRole === u.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs font-bold focus:ring-1 focus:ring-red-600 outline-none"
                            autoFocus
                          >
                            <option value="AGENT">AGENT</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="OWNER">OWNER</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(u.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button
                            onClick={() => { setChangingRole(null); setSelectedRole('') }}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${c.classes}`}>
                          {c.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Role change — OWNER only, not self */}
                        {isOwner && !isSelf && (
                          <button
                            onClick={() => {
                              setChangingRole(u.id)
                              setSelectedRole(u.role)
                              setError('')
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Change role"
                          >
                            <span className="material-symbols-outlined text-base">manage_accounts</span>
                          </button>
                        )}

                        {/* Delete — not self */}
                        {!isSelf && (
                          deleteId === u.id ? (
                            <div className="flex items-center gap-1 ml-2">
                              <span className="text-xs text-gray-500 mr-1">Remove?</span>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setDeleteId(u.id); setError('') }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove user"
                            >
                              <span className="material-symbols-outlined text-base">person_remove</span>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            {users.length} staff member{users.length !== 1 ? 's' : ''}
          </p>
          {isOwner && (
            <p className="text-xs text-gray-400">
              <span className="material-symbols-outlined text-xs align-text-bottom">manage_accounts</span>
              Only owners can change roles
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
