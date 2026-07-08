import { DashboardFile } from '@/hooks/useDashboardFiles'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Clock3, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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

function getUpdatedAtTime(file: DashboardFile): number {
  const updatedAt = file.updated_at as unknown

  if (updatedAt && typeof updatedAt === 'object' && 'toMillis' in updatedAt) {
    return (updatedAt as { toMillis: () => number }).toMillis()
  }

  if (updatedAt instanceof Date) {
    return updatedAt.getTime()
  }

  if (typeof updatedAt === 'string' || typeof updatedAt === 'number') {
    const parsedTime = new Date(updatedAt).getTime()

    return Number.isNaN(parsedTime) ? 0 : parsedTime
  }

  return 0
}

function sortInProgressFiles(files: DashboardFile[]): DashboardFile[] {
  return [...files].sort((firstFile, secondFile) => {
    if (firstFile.isUnassigned !== secondFile.isUnassigned) {
      return firstFile.isUnassigned ? 1 : -1
    }

    return getUpdatedAtTime(secondFile) - getUpdatedAtTime(firstFile)
  })
}

function sortCompletedFiles(files: DashboardFile[]): DashboardFile[] {
  return [...files].sort(
    (firstFile, secondFile) =>
      getUpdatedAtTime(secondFile) - getUpdatedAtTime(firstFile)
  )
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
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>(
    'in-progress'
  )
  const inProgressFiles = useMemo(
    () => sortInProgressFiles(files.filter((file) => !file.is_completed)),
    [files]
  )
  const completedFiles = useMemo(
    () => sortCompletedFiles(files.filter((file) => file.is_completed)),
    [files]
  )
  const hasUncompletedClaimedFile = useMemo(
    () =>
      files.some(
        (file) =>
          !file.is_completed &&
          (file.isClaimedByCurrentUser || !file.isUnassigned)
      ),
    [files]
  )
  const tableFiles =
    activeTab === 'completed' ? completedFiles : inProgressFiles

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
            hideClaimButton={hasUncompletedClaimedFile}
            onClaimFile={onClaimFile}
            onViewFile={onViewFile}
          />
        ),
      },
    ],
    [claimingFileUid, hasUncompletedClaimedFile, onClaimFile, onViewFile]
  )

  const table = useReactTable({
    data: tableFiles,
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

      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-6 pt-4">
        <button
          type="button"
          className={`-mb-px rounded-t-lg border px-4 py-2 text-sm font-bold transition ${
            activeTab === 'in-progress'
              ? 'border-slate-200 border-b-white bg-white text-indigo-700'
              : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('in-progress')}
        >
          Đang làm ({inProgressFiles.length})
        </button>
        <button
          type="button"
          className={`-mb-px rounded-t-lg border px-4 py-2 text-sm font-bold transition ${
            activeTab === 'completed'
              ? 'border-slate-200 border-b-white bg-white text-indigo-700'
              : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Đã hoàn thành ({completedFiles.length})
        </button>
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
                  {activeTab === 'completed'
                    ? 'Không có hồ sơ đã hoàn thành phù hợp.'
                    : 'Không có hồ sơ đang làm phù hợp.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
