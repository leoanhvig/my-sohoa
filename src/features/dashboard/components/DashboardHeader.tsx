import { Input } from '@/Components/ui/input'
import { Search } from 'lucide-react'
import { ChangeEvent } from 'react'

interface DashboardHeaderProps {
  userName: string
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

export function DashboardHeader({
  userName,
  globalFilter,
  onGlobalFilterChange,
}: DashboardHeaderProps) {
  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    onGlobalFilterChange(event.target.value)
  }

  return (
    <div className="bg-indigo-600 p-6 text-white">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Xin chào, {userName}!
          </h1>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="search"
              value={globalFilter}
              onChange={handleSearchChange}
              className="bg-white pl-9 font-semibold text-slate-900"
              placeholder="Tìm tên file..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
