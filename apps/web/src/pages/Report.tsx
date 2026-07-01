import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractSlugFromHost } from '../hooks/useTenant'
import ImageUploadZone from '../components/ImageUploadZone'
import FileUploadZone from '../components/FileUploadZone'

interface Category { id: string; name: string }

interface FormState {
  fullName: string; phoneNumber: string; email: string; issueCategory: string
  title: string; description: string
}

const initialForm: FormState = {
  fullName: '', phoneNumber: '', email: '', issueCategory: '', title: '', description: '',
}

export default function Report() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [publicToken, setPublicToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data) })
      .catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleReset() { setForm(initialForm); setImages([]); setContractFile(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setError(''); setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', form.title.trim())
      if (form.description) formData.append('description', form.description.trim())
      if (form.fullName) formData.append('guestName', form.fullName.trim())
      if (form.email) formData.append('guestEmail', form.email.trim())
      if (form.phoneNumber) formData.append('guestPhone', form.phoneNumber.trim())
      images.forEach((img) => formData.append('files', img))
      if (contractFile) formData.append('files', contractFile)

      const headers: Record<string, string> = {}
      const slug = extractSlugFromHost()
      if (slug) headers['X-Org-Slug'] = slug

      const res = await fetch('/api/tickets/public', { method: 'POST', headers, body: formData })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Submission failed')

      setPublicToken(json.data.publicToken)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-green-500 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Submitted</h1>
        <p className="text-gray-600 mb-6">Your issue has been received. Track progress using this link:</p>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg break-all">
            {window.location.origin}/track/{publicToken}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-4">Save this link to check your ticket status later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-gray-600 mt-2">Fill in the details below and our team will get back to you.</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-gray-600">ISSUE TITLE *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Brief title of the issue..."
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-gray-600">DESCRIPTION</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
            placeholder="Describe the issue in detail..." className="w-full p-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm resize-none" />
        </div>

        {/* Issue Photos */}
        <ImageUploadZone images={images} onChange={setImages} />

        {/* Contract File */}
        <FileUploadZone file={contractFile} onChange={setContractFile} />

        {/* Contact Info */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-gray-600">FULL NAME</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name"
            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-gray-600">PHONE NUMBER</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-gray-600">EMAIL</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 outline-none text-sm" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={handleReset}
            className="flex-1 h-12 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Reset
          </button>
          <button type="submit" disabled={submitting || !form.title.trim()}
            className="flex-1 h-12 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors">
            {submitting ? 'Submitting...' : 'Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  )
}
