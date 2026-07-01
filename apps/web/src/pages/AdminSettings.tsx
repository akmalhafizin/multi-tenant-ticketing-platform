import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface OrgSettings {
  id: string
  name: string
  slug: string
  welcomeMessage: string | null
  defaultCategoryId: string | null
  resolutionSlaHours: number | null
}

interface Category {
  id: string
  name: string
}

export default function AdminSettings() {
  const [org, setOrg] = useState<OrgSettings | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editable fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [defaultCategoryId, setDefaultCategoryId] = useState('')
  const [slaHours, setSlaHours] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [orgRes, catRes] = await Promise.all([
          api<OrgSettings>('/api/org'),
          api<Category[]>('/api/categories'),
        ])
        const o = orgRes.data
        setOrg(o)
        setName(o.name)
        setSlug(o.slug)
        setWelcomeMessage(o.welcomeMessage || '')
        setDefaultCategoryId(o.defaultCategoryId || '')
        setSlaHours(o.resolutionSlaHours ? String(o.resolutionSlaHours) : '')
        setCategories(catRes.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await api<OrgSettings>('/api/org', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          welcomeMessage: welcomeMessage.trim(),
          defaultCategoryId: defaultCategoryId || null,
          resolutionSlaHours: slaHours ? parseInt(slaHours) : null,
        }),
      })
      setOrg(res.data)
      setSuccess('Settings saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-gray-500">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
          Organization Settings
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 mt-2">
          Manage your organization's profile and public-facing configuration.
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

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* General */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">business</span>
            General
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Slug / Subdomain
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm font-mono"
              />
              <span className="text-xs text-gray-400">.lvh.me</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your public submission form will be at{' '}
              <span className="font-mono text-red-600">{slug || '{slug}'}.lvh.me/report</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Resolution SLA (hours)
            </label>
            <input
              type="number"
              min={0}
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              placeholder="e.g. 24"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Target time to resolve tickets. Shows as SLA progress on ticket details.
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">palette</span>
            Branding
          </h2>

          {/* Logo */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Organization Logo</label>
            {org?.logoUrl && (
              <div className="mb-3">
                <img src={org.logoUrl} alt="Logo" className="h-16 object-contain border border-gray-200 rounded-lg p-2 bg-white" />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const formData = new FormData()
                formData.append('file', file)
                formData.append('assetType', 'logo')
                try {
                  const res = await fetch('/api/org/assets', { method: 'POST', body: formData })
                  const json = await res.json()
                  if (json.success) setOrg(json.data.org)
                  else setError(json.error)
                } catch (err) { setError('Upload failed') }
              }} className="hidden" id="logo-upload" />
              <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                Choose Logo
              </span>
            </label>
            <p className="text-xs text-gray-400">Upload your organization logo. Shown in the header and public form.</p>
          </div>

          {/* Banner */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Banner Image</label>
            {org?.bannerUrl && (
              <div className="mb-3">
                <img src={org.bannerUrl} alt="Banner" className="h-24 w-full object-cover border border-gray-200 rounded-lg" />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const formData = new FormData()
                formData.append('file', file)
                formData.append('assetType', 'banner')
                try {
                  const res = await fetch('/api/org/assets', { method: 'POST', body: formData })
                  const json = await res.json()
                  if (json.success) setOrg(json.data.org)
                  else setError(json.error)
                } catch (err) { setError('Upload failed') }
              }} className="hidden" id="banner-upload" />
              <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                Choose Banner
              </span>
            </label>
            <p className="text-xs text-gray-400">Header image for the public ticket submission form.</p>
          </div>
        </div>

        {/* Public Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">public</span>
            Public Submission Form
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Welcome Message
            </label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              placeholder="Welcome message shown on the public ticket submission form..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Default Category
            </label>
            <select
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm appearance-none bg-white"
            >
              <option value="">No default category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Pre-selected category on the public form when no category is chosen.
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
