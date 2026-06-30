interface StatCardProps {
  icon: string
  label: string
  value: string
  sub?: string
  accent?: 'red' | 'green' | 'amber' | 'gray'
}

const accentBorder: Record<string, string> = {
  red:   'border-l-red-600',
  green: 'border-l-green-600',
  amber: 'border-l-amber-500',
  gray:  'border-l-gray-400',
}

const accentIconBg: Record<string, string> = {
  red:   'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  gray:  'bg-gray-100 text-gray-600',
}

export default function StatCard({ icon, label, value, sub, accent = 'gray' }: StatCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 border-l-4 ${accentBorder[accent]} flex flex-col gap-2`}>
      <div className="flex justify-between items-start">
        <span className={`material-symbols-outlined p-2 rounded ${accentIconBg[accent]}`}>
          {icon}
        </span>
      </div>
      <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">{label}</div>
      <div className="text-4xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-sm text-gray-500">{sub}</div>}
    </div>
  )
}
