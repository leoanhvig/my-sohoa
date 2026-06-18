import {
  useHealthFormRecordsCount,
  useHealthFormRecordsTotalCount,
} from '@/hooks/useHealthFormRecords'
import { useUserStore } from '@/stores/userStore'

export function HealthFormListHeader() {
  const authUser = useUserStore((state) => state.authUser)
  const { data: currentUserRecordsCount = 0 } = useHealthFormRecordsCount(
    authUser?.uid
  )
  const { data: totalRecordsCount = 0 } = useHealthFormRecordsTotalCount()

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Tổng dự liệu bạn đã nhập
        </p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight text-indigo-700">
            {currentUserRecordsCount}
          </span>
          <span className="pb-1 text-sm font-semibold text-slate-500">
            record
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Tổng HealthForm đã nhập
        </p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight text-emerald-700">
            {totalRecordsCount}
          </span>
          <span className="pb-1 text-sm font-semibold text-slate-500">
            record
          </span>
        </div>
      </div>
    </section>
  )
}
