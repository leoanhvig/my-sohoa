import { ShieldCheck } from 'lucide-react'

interface DashboardFileStatusProps {
  isUnassigned: boolean
}

export function DashboardFileStatus({
  isUnassigned,
}: DashboardFileStatusProps) {
  if (isUnassigned) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
        <ShieldCheck className="h-3.5 w-3.5" /> Chưa nhận
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-600 px-2.5 py-1 text-xs font-bold text-white">
      <ShieldCheck className="h-3.5 w-3.5" /> Đang xử lý
    </span>
  )
}
