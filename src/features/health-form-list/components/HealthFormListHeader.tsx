interface HealthFormListHeaderProps {
  currentUserRecordsCount: number
}

export function HealthFormListHeader({
  currentUserRecordsCount,
}: HealthFormListHeaderProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            List HealthForm
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Chọn user để xem danh sách form sức khỏe đã nhập.
          </p>
        </div>
        <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
          Tổng user hiện tại: {currentUserRecordsCount} record
        </div>
      </div>
    </section>
  )
}
