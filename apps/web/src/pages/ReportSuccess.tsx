import { useLocation, Link } from 'react-router-dom'

interface SuccessState {
  category?: string
  urgency?: number
}

const categoryLabels: Record<string, string> = {
  mechanical: 'Mechanical Failure',
  electrical: 'Electrical Malfunction',
  structural: 'Structural Damage',
  hvac: 'HVAC Issues',
  other: 'Other',
}

const urgencyLabels: Record<number, { label: string; tone: string }> = {
  1: { label: 'Low Priority', tone: 'bg-gray-100 text-gray-700' },
  2: { label: 'Low-Medium Priority', tone: 'bg-gray-100 text-gray-700' },
  3: { label: 'Medium Priority', tone: 'bg-amber-100 text-amber-700' },
  4: { label: 'High Priority', tone: 'bg-red-100 text-red-700' },
  5: { label: 'Critical Priority', tone: 'bg-red-100 text-red-700' },
}

function ReportSuccess() {
  const location = useLocation()
  const state = (location.state as SuccessState) || {}

  const categoryLabel = state.category ? categoryLabels[state.category] ?? state.category : '—'
  const urgency = state.urgency ? urgencyLabels[state.urgency] : null

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
      {/* Success Hero Section */}
      <div className="md:col-span-12 flex flex-col items-center text-center mb-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <span
            className="material-symbols-outlined text-red-600 text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
          Issue Submitted Successfully!
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 max-w-2xl">
          Thank you for reporting this issue. Our engineering team has been notified and will
          review your request shortly.
        </p>
      </div>

      {/* Summary Bento Grid */}
      <div className="md:col-span-7 bg-white border border-gray-200 p-8 flex flex-col justify-between rounded-lg">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span
              className="material-symbols-outlined text-red-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              description
            </span>
            <h2 className="text-xl font-semibold">Ticket Summary</h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">Category</span>
              <span className="text-base font-semibold text-gray-900">{categoryLabel}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">Urgency</span>
              {urgency ? (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${urgency.tone}`}>
                  {urgency.label}
                </span>
              ) : (
                <span className="text-base text-gray-900">—</span>
              )}
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">Reference ID</span>
              <span className="text-base font-mono text-gray-900">Pending</span>
            </div>
            <div className="flex justify-between items-center pb-4">
              <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">Date Submitted</span>
              <span className="text-base text-gray-900">Pending</span>
            </div>
          </div>
        </div>
        <div className="mt-8 p-4 bg-gray-50 flex items-start gap-4 rounded">
          <span className="material-symbols-outlined text-gray-500">info</span>
          <p className="text-xs text-gray-500">
            A confirmation email with these details and a tracking link has been sent to your
            registered address.
          </p>
        </div>
      </div>

      {/* Action Card Section */}
      <div className="md:col-span-5 flex flex-col gap-6">
        {/* Decorative Engineering Visual */}
        <div className="relative h-48 w-full overflow-hidden border border-gray-200 rounded-lg">
          <img
            alt="Engineering documentation"
            className="w-full h-full object-cover grayscale opacity-50 contrast-125"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP3ApKhRI8P270Qjs9tUPfw1c_R2lK1Ir7CuuK9Egsibq85WQ6TChBkbwSKRJZRi0nu7wjOZV8pFsGvhVrw2ATMrjxj7Hqg7KSvhJggJrm2EX_FqiJnFBXxYwRw7_uiPr3_ryQeNHjQ9o0sIO92mGVlbCtpgfTX3F8yhHXowrLWgklaiaesYyYQI_igfw6rO0OudUc1oE24jKqb868a0bk6koqwPM3DD7RYGlSyI4mlhV0W6RzOsFsCwiRi6Ojglc_-mSLLf9GBZRN"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/report"
            className="w-full bg-red-600 text-white text-xs font-medium py-4 uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2 rounded"
          >
            <span className="material-symbols-outlined text-lg">add_task</span>
            Submit another issue
          </Link>
          <Link
            to="/"
            className="w-full bg-gray-100 text-gray-900 text-xs font-medium py-4 uppercase tracking-widest hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center gap-2 rounded"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Go to Home
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-2">
          <h4 className="text-xs font-bold text-gray-900 mb-4">Need immediate assistance?</h4>
          <a className="flex items-center gap-3 text-red-600 group" href="#">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="group-hover:underline">Contact Technical Support</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ReportSuccess
