import { DashboardFile } from '@/hooks/useDashboardFiles'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Clock3, Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { DashboardFileActions } from './DashboardFileActions'
import { DashboardFileStatus } from './DashboardFileStatus'

interface DashboardFilesTableProps {
  files: DashboardFile[]
  loading: boolean
  error: string
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  claimingFileUid: string
  onClaimFile: (file: DashboardFile) => void
  onViewFile: (fileUid: string) => void
}

export function DashboardFilesTable({
  files,
  loading,
  error,
  globalFilter,
  onGlobalFilterChange,
  claimingFileUid,
  onClaimFile,
  onViewFile,
}: DashboardFilesTableProps) {
  const columns = useMemo<ColumnDef<DashboardFile>[]>(
    () => [
      {
        accessorKey: 'file_name',
        header: 'Tên file',
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-slate-900">
              {row.original.file_name}
            </div>
            <div className="text-xs text-slate-500">ID: {row.original.uid}</div>
          </div>
        ),
      },
      {
        accessorKey: 'number_of_file',
        header: 'Tiến độ',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700">
            {row.original.number_of_file_done || 0}/
            {row.original.number_of_file || 0} trang
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <DashboardFileStatus
            isUnassigned={row.original.isUnassigned}
            isCompleted={row.original.is_completed}
          />
        ),
      },
      {
        id: 'action',
        header: 'Hành động',
        cell: ({ row }) => (
          <DashboardFileActions
            file={row.original}
            isClaiming={claimingFileUid === row.original.uid}
            onClaimFile={onClaimFile}
            onViewFile={onViewFile}
          />
        ),
      },
    ],
    [claimingFileUid, onClaimFile, onViewFile]
  )

  const table = useReactTable({
    data: files,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <Clock3 className="h-5 w-5" /> Danh sách hồ sơ
        </h2>
        <span className="w-fit rounded-full bg-slate-600 px-3 py-1 text-xs font-bold text-white">
          Tổng: {table.getFilteredRowModel().rows.length} file
        </span>
      </div>

      {error && (
        <div className="m-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={
                      header.column.id === 'action'
                        ? 'px-6 py-3 text-right font-bold text-slate-600'
                        : 'px-6 py-3 text-left font-bold text-slate-600'
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center">
                  <span className="inline-flex items-center gap-2 font-semibold text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                  </span>
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={
                        cell.column.id === 'action'
                          ? 'px-6 py-4 text-right'
                          : 'px-6 py-4'
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                >
                  Không có hồ sơ phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
