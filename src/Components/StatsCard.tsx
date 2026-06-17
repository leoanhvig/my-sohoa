import { Loader2 } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  loading?: boolean
  className?: string
  valueClassName?: string
}

export default function StatsCard({
  title,
  value,
  loading = false,
  className = 'border-sky-200 bg-sky-50',
  valueClassName = 'text-emerald-600',
}: StatsCardProps) {
  return (
    <div className={`rounded-xl border p-6 text-center shadow-sm ${className}`}>
      <h2 className="mb-4 text-center text-lg font-bold text-slate-900">
        {title}
      </h2>
      <div
        className={`flex min-h-[48px] items-center justify-center text-center text-4xl font-extrabold ${valueClassName}`}
      >
        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : value}
      </div>
    </div>
  )
}
