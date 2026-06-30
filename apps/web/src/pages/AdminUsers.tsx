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

interface Invite {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
}

const roleConfig: Record<string, { label: string; classes: string }> = {
  OWNER: { label: 'OWNER', classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  ADMIN: { label: 'ADMIN', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  AGENT: { label: 'AGENT', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'PENDING', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  ACCEPTED: { label: 'ACCEPTED', classes: 'bg-green-100 text-green-700 border-green-200' },
  EXPIRED: { label: 'EXPIRED', classes: 'bg-gray-100 text-gray-500 border-gray-200' },
  REVOKED: { label: 'REVOKED', classes: 'bg-red-100 text-red-700 border-red-200' },
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<OrgUser[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Tab state
  const [tab, setTab] = useState<'staff' | 'invites'>('staff')

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('AGENT')

  // Role change state
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  // Revoke confirm
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [userRes, inviteRes] = await Promise.all([
        api<OrgUser[]>('/api/users'),
        api<Invite[]>('/api/invites'),
      ])
      setUsers(userRes.data)
      setInvites(inviteRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleRoleChange(userId: string) {
    if (!selectedRole) return
    try {
      await api(`/api/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: selectedRole }) })
      setChangingRole(null); setSelectedRole('')
      showSuccess('Role updated')
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  async function handleDelete(userId: string) {
    try {
      await api(`/api/users/${userId}`, { method: 'DELETE' })
      setDeleteId(null)
      showSuccess('User removed')
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    try {
      const res = await api<{ inviteLink: string; token: string }>('/api/invites', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      setInviteEmail(''); setShowInviteForm(false)
      showSuccess(`Invite sent! Link: ${res.data.inviteLink}`)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite')
    }
  }

  async function handleRevoke(inviteId: string) {
    try {
      await api(`/api/invites/${inviteId}/revoke`, { method: 'PATCH' })
      setRevokeId(null)
      showSuccess('Invite revoked')
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite')
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setError('')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const isOwner = currentUser?.role === 'OWNER'
  const canManage = isOwner || currentUser?.role === 'ADMIN'

  if (loading) {
    return <div className="max-w-5xl mx-auto py-12 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">Staff Management</h1>
          <p className="text-lg leading-relaxed text-gray-600 mt-2">Manage users and invite new team members.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Invite Staff
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setTab('staff')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            tab === 'staff' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Staff ({users.length})
        </button>
        <button
          onClick={() => setTab('invites')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            tab === 'invites' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Invites ({invites.length})
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
          <span className="break-all">{successMsg}</span>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Invite New Staff</h3>
          <form onSubmit={handleCreateInvite} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="flex-1 w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full sm:w-32 h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm appearance-none bg-white"
            >
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex gap-2 w-full sm:w-auto">
              <button type="submit" className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors">
                Send Invite
              </button>
              <button type="button" onClick={() => setShowInviteForm(false)} className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Staff */}
      {tab === 'staff' && (
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
                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${isSelf ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">{u.name || '—'}</span>
                            {isSelf && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">YOU</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        {changingRole === u.id ? (
                          <div className="flex items-center gap-2">
                            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded text-xs font-bold focus:ring-1 focus:ring-red-600 outline-none" autoFocus>
                              <option value="AGENT">AGENT</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="OWNER">OWNER</option>
                            </select>
                            <button onClick={() => handleRoleChange(u.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><span className="material-symbols-outlined text-sm">check</span></button>
                            <button onClick={() => { setChangingRole(null); setSelectedRole('') }} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><span className="material-symbols-outlined text-sm">close</span></button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${c.classes}`}>{c.label}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isOwner && !isSelf && (
                            <button onClick={() => { setChangingRole(u.id); setSelectedRole(u.role); setError('') }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Change role">
                              <span className="material-symbols-outlined text-base">manage_accounts</span>
                            </button>
                          )}
                          {!isSelf && (
                            deleteId === u.id ? (
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-gray-500 mr-1">Remove?</span>
                                <button onClick={() => handleDelete(u.id)} className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Yes</button>
                                <button onClick={() => setDeleteId(null)} className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">No</button>
                              </div>
                            ) : (
                              <button onClick={() => { setDeleteId(u.id); setError('') }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove">
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
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-500">
            {users.length} staff member{users.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* TAB: Invites */}
      {tab === 'invites' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No invites yet. Click "Invite Staff" to invite a new team member.
                    </td>
                  </tr>
                ) : (
                  invites.map((inv) => {
                    const sc = statusConfig[inv.status] || statusConfig.PENDING
                    const isExpired = inv.status === 'PENDING' && new Date(inv.expiresAt) < new Date()
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${roleConfig[inv.role]?.classes || ''}`}>
                            {inv.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${isExpired ? 'bg-gray-100 text-gray-500 border-gray-200' : sc.classes}`}>
                            {isExpired ? 'EXPIRED' : sc.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {inv.status === 'PENDING' && !isExpired && (
                            revokeId === inv.id ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-gray-500 mr-1">Revoke?</span>
                                <button onClick={() => handleRevoke(inv.id)} className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Yes</button>
                                <button onClick={() => setRevokeId(null)} className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">No</button>
                              </div>
                            ) : (
                              <button onClick={() => { setRevokeId(inv.id); setError('') }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Revoke invite">
                                <span className="material-symbols-outlined text-base">cancel</span>
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-500">
            {invites.length} invite{invites.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}
    </div>
  )
}
