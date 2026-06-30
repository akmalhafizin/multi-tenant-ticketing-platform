import { useState } from 'react'

interface LoginForm {
  adminId: string
  password: string
  remember: boolean
}

const initialLoginForm: LoginForm = {
  adminId: '',
  password: '',
  remember: false,
}

type View = 'login' | 'forgot' | 'forgot-sent'

function Login() {
  const [view, setView] = useState<View>('login')
  const [form, setForm] = useState<LoginForm>(initialLoginForm)
  const [forgotEmail, setForgotEmail] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // TODO: replace this with a real call to your apps/api auth endpoint, e.g.:
    // await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(form),
    // })

    console.log('Login attempt:', form)
    alert('Sign-in is not connected to a backend yet — check the console for the submitted values.')
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault()

    // TODO: replace this with a real call to your apps/api password-reset endpoint, e.g.:
    // await fetch('/api/auth/forgot-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: forgotEmail }),
    // })

    console.log('Password reset requested for:', forgotEmail)
    setView('forgot-sent')
  }

  function backToLogin() {
    setView('login')
    setForgotEmail('')
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16">
      {/* Branding Header */}
      <div className="text-center mb-10">
        <div className="inline-block p-4 mb-6 bg-white border border-gray-200 rounded-lg">
          <img
            alt="RCL Engineering and Facilities corporate logo"
            className="h-16 w-auto object-contain mx-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD6Yua9KrhL9Whjxc8MxaTebQvS2DlmVO-CupB1qQiwgCeBCGUiBJliZHjz9k4dsrOC9ET___kP6w97q3gUhsWfubjOdGkVPkbj8SiumI8C3QhkcGp20osmRuXwXjEjoxfLm_Zr4IPtnWPBY-b5-9WP_Fc5DWb2g3QktcTVEqSNKVBfcn4fc7F2Ct1jstH58Cbhweyh9lmeA1sCMU_1dpzCs8w8k-n6cbbDZOOEkKBo-mbQQx5t9p9oLm4vDw9y9mAnvBC9nXPHYUd"
          />
        </div>
        {view === 'login' && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">Portal Access</h1>
            <p className="text-gray-500 uppercase tracking-widest text-xs">Administrative Terminal</p>
          </>
        )}
        {view === 'forgot' && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-500 uppercase tracking-widest text-xs">Administrative Terminal</p>
          </>
        )}
        {view === 'forgot-sent' && (
          <>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-500 uppercase tracking-widest text-xs">Administrative Terminal</p>
          </>
        )}
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-10">
        {view === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="adminId" className="text-xs font-medium tracking-wide text-gray-700">
                Admin ID / Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  person
                </span>
                <input
                  id="adminId"
                  name="adminId"
                  type="text"
                  value={form.adminId}
                  onChange={handleChange}
                  placeholder="Enter identification"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded text-base focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-medium tracking-wide text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-xs font-medium tracking-wide text-red-600 hover:text-red-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded text-base focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
              />
              <label htmlFor="remember" className="text-xs font-medium tracking-wide text-gray-600">
                Secure session for 8 hours
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium tracking-wide py-4 rounded transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Sign In
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <p className="text-sm text-gray-600">
              Enter the email linked to your admin account and we'll send you a link to reset your password.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="forgotEmail" className="text-xs font-medium tracking-wide text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  mail
                </span>
                <input
                  id="forgotEmail"
                  name="forgotEmail"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. admin@rclengineering.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded text-base focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium tracking-wide py-4 rounded transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Send Reset Link
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={backToLogin}
              className="w-full text-xs font-medium tracking-wide text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Sign In
            </button>
          </form>
        )}

        {view === 'forgot-sent' && (
          <div className="space-y-6 text-center">
            <span className="material-symbols-outlined text-5xl text-red-600">mark_email_read</span>
            <p className="text-sm text-gray-600">
              If an account exists for <span className="font-medium text-gray-900">{forgotEmail}</span>,
              a password reset link is on its way. Check your inbox (and spam folder).
            </p>
            <button
              type="button"
              onClick={backToLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium tracking-wide py-4 rounded transition-all duration-200 flex items-center justify-center gap-2"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>

      {/* Additional Help */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Restricted access for authorized personnel only.
          <br />
          All terminal activity is monitored and logged.
        </p>
      </div>
    </div>
  )
}

export default Login
