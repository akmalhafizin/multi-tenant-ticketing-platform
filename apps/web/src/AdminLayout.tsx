import { Outlet, Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/tickets', label: 'Ticket Management', icon: 'confirmation_number' },
  { to: '/admin/reports', label: 'Reports', icon: 'analytics' },
]

function AdminLayout() {
  const location = useLocation()

  return (
    <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-50 bg-gray-50 border-r border-gray-200 flex flex-col py-6 gap-2">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <img
            alt="RCL Logo"
            className="h-10 w-auto object-contain self-start"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBVs6VTy-jn7DZMlvPwdEN1xEp8RQz8O1MNAv4q4x9NR0PAFgWNflwPD2cqCJvyHYYNtI6sA7bvua2P6ATu--J52qnAG_CtpeyLsHTKMcAAvRR1a_kcn3iQi3ajv4k89Q6Vs7Z17bMrZVl2xquQ9ojIz6-x6J1U-HFY5ERJKuw9Tvj_iew4bZg2z1h-c5Gzs7Y0h8pZm8hpjwUFpZbax2hDovGRQrKWCr8u90liFMz7YNnasURe8V3BqIkCOueg_XrlwVLL0Rroo7-"
          />
          <h1 className="text-xl font-black text-red-600 mt-4">RCL Admin</h1>
          <p className="text-sm font-medium tracking-wide text-gray-600">Facility Management</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive
                    ? 'flex items-center px-4 py-3 text-sm font-medium tracking-wide rounded-lg text-red-600 bg-red-50 border-r-4 border-red-600 transition-all duration-200 ease-in-out'
                    : 'flex items-center px-4 py-3 text-sm font-medium tracking-wide rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out'
                }
              >
                <span className="material-symbols-outlined mr-3">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 mt-auto">
          <div className="flex items-center p-4 bg-white rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
              <img
                alt="Admin Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlWxgTXHyrMUwWu6e_PFadt_KFRiEqV9OCF5Uaf1H7YxLzkWTdxJOGDU4oVlNRRKnJTMDiWr3f0y-QuZNXozOZQjFkwIRwaUKYGkcaA3QtIFuJ-krM0YkvZasdF6cM_5YgGXx1h50TU8N7vXk_EqZ63RAK2wLaRUTT1DYU-blnsg8bPr8AGAI2jUtBeq7rOzsxH6fTB86FZD6H6SwcOvkNiOz6j9jIhTwnaNwbAHNEt9DHleduQIq6VcnaYelUwG7LIpQDgIiX_F7k"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">System Controller</p>
            </div>
          </div>
        </div>
      </aside>

      {/* TopAppBar */}
      <header className="fixed top-0 right-0 left-64 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-900 font-bold text-lg tracking-tight">RCL Admin Console</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Search..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors active:opacity-80">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors active:opacity-80">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 px-8 pb-12 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
