import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="relative min-h-[870px] flex items-center px-6 md:px-12 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-gray-700 text-xs uppercase tracking-widest font-semibold">
            Engineering Excellence
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Integrated Facilities <span className="text-red-600">Engineering</span> Solutions
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 max-w-lg">
            Delivering world-class engineering maintenance and facilities management with precision, safety, and operational excellence for industrial leaders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/report"
              className="bg-red-600 text-white px-8 py-4 rounded font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/10"
            >
              Report an Issue <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
            <img
              alt="Professional Engineering Work"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7W0_JqiZRIevwZ8jjrA0hy6j9ddfR-lnxZwJX_joN1ftNhaw33q8X9Je2qBZxBKZ2nGNjryBGJkKHXNi-qbneAGB_nOLgRlbbMmmVfWtPsdEQVnjZgt1qdZUXSiAyjn9STFIbwhpVh-Xg1oq3bmgRl0gXUByBkAC5C5HtYHb92soyT3rXEZNk1wlqCft5BP15lkscrpboJJexIdWRkOINERLera3QgCrIpLu3UD_jmOeKWEylX1oIBuD-ic5IpiDmS_y30umkTMKB"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent"></div>
          </div>
          {/* Floating Data Card */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl border border-gray-100 max-w-[240px]">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="material-symbols-outlined text-red-600"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="text-xs tracking-wide font-medium text-gray-600">ISO CERTIFIED</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">99.9%</p>
            <p className="text-xs text-gray-600 mt-1">Operational Uptime Guaranteed</p>
          </div>
        </div>
      </div>
      {/* Background Decorative Element */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gray-100 -skew-x-12 translate-x-1/2 z-0"></div>
    </section>
  )
}

export default Home
