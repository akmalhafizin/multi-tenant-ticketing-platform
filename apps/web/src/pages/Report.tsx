import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractSlugFromHost } from '../hooks/useTenant'

interface FormState {
  fullName: string
  phoneNumber: string
  email: string
  companyName: string
  generalLocation: string
  issueCategory: string
  specificLocation: string
  description: string
  urgency: number
}

const initialForm: FormState = {
  fullName: '',
  phoneNumber: '',
  email: '',
  companyName: '',
  generalLocation: '',
  issueCategory: '',
  specificLocation: '',
  description: '',
  urgency: 3,
}

function Report() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // File uploads
  const [images, setImages] = useState<File[]>([])
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const categoryLabels: Record<string, string> = {
    mechanical: 'Mechanical Failure',
    electrical: 'Electrical Malfunction',
    structural: 'Structural Damage',
    hvac: 'HVAC Issues',
    other: 'Other',
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'urgency' ? Number(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const headers: Record<string, string> = {}

      // Inject org slug from subdomain
      const slug = extractSlugFromHost()
      if (slug) {
        headers['X-Org-Slug'] = slug
      }

      // Build FormData for multipart upload
      const formData = new FormData()
      formData.append('title', `${form.issueCategory ? (categoryLabels[form.issueCategory] || form.issueCategory) : 'Uncategorized'} Issue`)
      formData.append('description', form.description)
      formData.append('guestName', form.fullName)
      formData.append('guestEmail', form.email)
      formData.append('guestPhone', form.phoneNumber)
      images.forEach((file) => formData.append('files', file))
      if (contractFile) formData.append('files', contractFile)

      const res = await fetch(`${API_BASE}/api/tickets/public`, {
        method: 'POST',
        headers, // no Content-Type — browser sets it for FormData
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit issue')
      }

      navigate('/report/success', {
        state: {
          category: form.issueCategory,
          urgency: form.urgency,
          ticketId: json.data.id,
          publicToken: json.data.publicToken,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(initialForm)
    setImages([])
    setContractFile(null)
  }

  const urgencyLabels = ['1 - Low', '2', '3 - Medium', '4', '5 - Critical']

  return (
    <>
      {/* Hero Section for Context */}
      <div className="max-w-4xl mx-auto mb-12 px-4">
        <span className="text-red-600 text-xs font-medium uppercase tracking-widest mb-4 block">
          Service Desk
        </span>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
          Report an Issue
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 max-w-2xl">
          Submit technical or facilities-related issues directly to our engineering team
          for rapid intervention and resolution.
        </p>
      </div>

      {/* Issue Submission Form Container */}
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden px-4 sm:px-0">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-base mt-0.5">error</span>
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} onReset={handleReset} className="divide-y divide-gray-200">
          {/* Section 1: Individual Details */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-red-600">person</span>
              <h2 className="text-xl font-semibold">Individual Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-gray-600">FULL NAME</label>
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-gray-600">PHONE NUMBER</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+60 12-345 6789"
                  className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-gray-600">EMAIL ADDRESS (OPTIONAL)</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. john@company.com"
                  className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-gray-600">COMPANY NAME</label>
                <input
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Organization"
                  className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-gray-600">GENERAL LOCATION</label>
                <input
                  name="generalLocation"
                  type="text"
                  value={form.generalLocation}
                  onChange={handleChange}
                  placeholder="City or Region"
                  className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Issue Details */}
          <div className="p-8 bg-white">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-red-600">report_problem</span>
              <h2 className="text-xl font-semibold">Issue Details</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-gray-600">ISSUE CATEGORY</label>
                  <select
                    name="issueCategory"
                    value={form.issueCategory}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all appearance-none"
                  >
                    <option value="">Select Category</option>
                    <option value="mechanical">Mechanical Failure</option>
                    <option value="electrical">Electrical Malfunction</option>
                    <option value="structural">Structural Damage</option>
                    <option value="hvac">HVAC Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-gray-600">SPECIFIC LOCATION DETAIL</label>
                  <input
                    name="specificLocation"
                    type="text"
                    value={form.specificLocation}
                    onChange={handleChange}
                    placeholder="e.g. Block B, Level 4, Room 402"
                    className="w-full h-12 px-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium tracking-wide text-gray-600">ISSUE DESCRIPTION</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the engineering fault or facility issue..."
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium tracking-wide text-gray-600">URGENCY LEVEL</label>
                  <span className="text-red-600 font-bold text-sm">Criticality Scale</span>
                </div>
                <div className="px-2">
                  <input
                    name="urgency"
                    type="range"
                    min={1}
                    max={5}
                    value={form.urgency}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 tracking-tighter uppercase">
                    {urgencyLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Documentation & Uploads (visual only, not yet wired up) */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-red-600">attachment</span>
              <h2 className="text-xl font-semibold">Documentation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-xs font-medium tracking-wide text-gray-600">ISSUE PHOTOS (MULTIPLE)</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const dropped = Array.from(e.dataTransfer.files).filter(
                      (f) => f.type.startsWith('image/')
                    )
                    setImages((prev) => [...prev, ...dropped].slice(0, 5))
                  }}
                  onClick={() => document.getElementById('image-input')?.click()}
                >
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-red-600 transition-colors">
                    add_a_photo
                  </span>
                  <p className="text-base text-gray-900">
                    Drag &amp; drop or <span className="text-red-600 font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Upload up to 5 clear images (JPG, PNG)</p>
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const selected = Array.from(e.target.files || [])
                      setImages((prev) => [...prev, ...selected].slice(0, 5))
                      e.target.value = ''
                    }}
                  />
                </div>
                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[8px] px-1 py-0.5 truncate text-center">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Contract/File Upload */}
              <div className="space-y-4">
                <label className="text-xs font-medium tracking-wide text-gray-600">CONTRACT / SCHEMATIC FILE</label>
                <div
                  className="border border-gray-300 rounded-lg p-4 bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('contract-input')?.click()}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-500">
                      {contractFile ? 'description' : 'upload_file'}
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {contractFile ? contractFile.name : 'Reference Contract'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {contractFile
                          ? `${(contractFile.size / 1024 / 1024).toFixed(1)} MB`
                          : 'PDF, DWG or DOCX (Max 25MB)'}
                      </p>
                    </div>
                  </div>
                  {contractFile ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setContractFile(null)
                      }}
                      className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider"
                    >
                      Choose File
                    </button>
                  )}
                  <input
                    id="contract-input"
                    type="file"
                    accept=".pdf,.dwg,.docx,.doc,.zip,.rar"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setContractFile(file)
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-sm">info</span>
                  <p className="text-[11px] text-blue-800 leading-tight">
                    Providing the maintenance contract or technical schematic speeds up verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-8 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <p className="text-xs">Your data is secured under our ISO-certified privacy standards.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                type="reset"
                className="flex-1 md:flex-none px-8 py-3 text-xs font-medium border border-gray-300 text-gray-900 hover:bg-gray-100 transition-colors rounded"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 md:flex-none px-12 py-3 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 transition-colors shadow-lg rounded"
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT ISSUE'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Secondary Info Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-4 mb-12">
        <div className="bg-white p-6 border border-gray-200 rounded shadow-sm">
          <span className="material-symbols-outlined text-red-600 mb-4 block">support_agent</span>
          <h4 className="text-sm font-bold mb-2">Technical Support</h4>
          <p className="text-xs text-gray-500">Speak directly with a technician for urgent critical failures.</p>
          <a className="inline-block mt-4 text-xs font-bold text-red-600 border-b border-red-600" href="#">
            CALL NOW
          </a>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded shadow-sm">
          <span className="material-symbols-outlined text-red-600 mb-4 block">timer</span>
          <h4 className="text-sm font-bold mb-2">Response Time</h4>
          <p className="text-xs text-gray-500">Average response within 4 hours for level 4-5 issues.</p>
          <a className="inline-block mt-4 text-xs font-bold text-red-600 border-b border-red-600" href="#">
            SLA DETAILS
          </a>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded shadow-sm">
          <span className="material-symbols-outlined text-red-600 mb-4 block">track_changes</span>
          <h4 className="text-sm font-bold mb-2">Track Status</h4>
          <p className="text-xs text-gray-500">Use your ticket ID sent via email to track repair progress.</p>
          <a className="inline-block mt-4 text-xs font-bold text-red-600 border-b border-red-600" href="#">
            TRACK ISSUE
          </a>
        </div>
      </div>
    </>
  )
}

export default Report
