import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div className="text-gray-900">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <nav className="flex justify-between items-center px-6 md:px-12 py-4 max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <img
              alt="RCL Engineering Logo"
              className="h-10 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZXhw6RfytJ26O3RrSfRMxC6mXGV98-07J3WnWRv199ortX9b2LgPRTxfUFVVqLe4nQy_0wf5mjpg54nFSBtAUCkB9LNBjaaY5_Px0mj9syrkxgkD7uEyG7yZv2QJXiPhlm6SLdf-1fEJCIdsYqu6R7gDfKQWul1q5l655WdMjClDZzCqi74N23XzEYl2q2U5RNMdRehfVxmx8A_HvNoIuHFL2LLPsWlNPe3PHaO3N0TVFSCTT1hsjEn-MiTHRwlOtYm3wPFHVPyDF"
            />
            <span className="text-xl font-bold tracking-tighter text-gray-900">RCL Engineering</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <Link
              className="font-sans antialiased text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200"
              to="/"
            >
              Home
            </Link>
            <Link
              className="font-sans antialiased text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200"
              to="/projects"
            >
              Projects
            </Link>
            <Link
              className="font-sans antialiased text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200 inline-flex items-center gap-1"
              to="/login"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        {/* This is where each page's content renders */}
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 max-w-full mx-auto">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-lg font-bold text-gray-900">RCL Engineering &amp; Facilities Sdn Bhd</span>
            <span className="font-sans text-xs tracking-wide text-gray-500">SSM: 202501015082</span>
            <span className="font-sans text-xs tracking-wide text-gray-500">
              © 2026 RCL Engineering &amp; Facilities Sdn Bhd. All rights reserved.
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-sans text-xs tracking-wide text-gray-500 hover:text-gray-900 transition-opacity opacity-80 hover:opacity-100" href="#">
              Privacy Policy
            </a>
            <a className="font-sans text-xs tracking-wide text-gray-500 hover:text-gray-900 transition-opacity opacity-80 hover:opacity-100" href="#">
              Terms of Service
            </a>
            <a className="font-sans text-xs tracking-wide text-gray-500 hover:text-gray-900 transition-opacity opacity-80 hover:opacity-100" href="#">
              Contact Support
            </a>
            <a className="font-sans text-xs tracking-wide text-gray-500 hover:text-gray-900 transition-opacity opacity-80 hover:opacity-100" href="#">
              Safety Standards
            </a>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-red-600 transition-colors">public</span>
            <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-red-600 transition-colors">mail</span>
            <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-red-600 transition-colors">location_on</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
