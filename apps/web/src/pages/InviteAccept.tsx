import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<{
    email: string
    role: string
    organizationName: string
    organizationSlug: string
  } | null>(null)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    api<typeof invite>(`/api/invites/${token}`)
      .then((res) => {
        setInvite(res.data)
        setName(res.data.email.split('@')[0])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api(`/api/invites/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), password }),
      })
      navigate('/login', { state: { accepted: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Verifying invite...</p>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">link_off</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Invite</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/login" className="text-red-600 hover:underline font-medium">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 mb-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-2xl font-black text-red-600">{invite?.organizationName?.charAt(0) || '?'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join {invite?.organizationName}</h1>
          <p className="text-gray-500 text-sm mt-1">
            You've been invited as{' '}
            <span className="font-semibold text-gray-700">{invite?.role}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Email</label>
              <input
                type="text"
                value={invite?.email || ''}
                disabled
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
            >
              {submitting ? 'Creating Account...' : 'Accept Invite & Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
