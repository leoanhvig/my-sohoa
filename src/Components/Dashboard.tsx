import { useQueryClient } from '@tanstack/react-query'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Clock3,
  Eye,
  FilePenLine,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { claimFileRecord } from '../apis/file'
import { DashboardFile, useDashboardFiles } from '../hooks/useDashboardFiles'
import { useUnassignedFilesCount } from '../hooks/useUnassignedFilesCount'
import { useUserStore } from '../stores/userStore'
import StatsCard from './StatsCard'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authUser = useUserStore((state) => state.authUser)
  const userRecord = useUserStore((state) => state.userRecord)
  const userName = userRecord?.user_name ?? authUser?.email ?? 'người dùng'
  const [globalFilter, setGlobalFilter] = useState('')
  const [claimingFileUid, setClaimingFileUid] = useState('')
  const { files, loading, error, refetch } = useDashboardFiles(authUser?.uid)
  const {
    data: unassignedFilesCount = 0,
    isLoading: loadingUnassignedFilesCount,
  } = useUnassignedFilesCount()

  async function handleClaimFile(file: DashboardFile) {
    if (!authUser?.uid) return

    try {
      setClaimingFileUid(file.uid)
      await claimFileRecord({
        fileUid: file.uid,
        userUid: authUser.uid,
      })
      await refetch()
      await queryClient.invalidateQueries({
        queryKey: ['files', 'unassigned-count'],
      })
      navigate(`/file/${file.uid}`)
    } finally {
      setClaimingFileUid('')
    }
  }

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
        header: 'Số lượng file',
        cell: ({ row }) => (
          <span className="font-bold text-slate-700">
            {row.original.number_of_file || 0}
          </span>
        ),
      },
      {
        accessorKey: 'completed_file_count',
        header: 'Đã hoàn thành',
        cell: ({ row }) => (
          <span className="font-bold text-emerald-600">
            {row.original.completed_file_count || 0}/
            {row.original.number_of_file || 0}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) =>
          row.original.isUnassigned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Chưa nhận
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-600 px-2.5 py-1 text-xs font-bold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Đang xử lý
            </span>
          ),
      },
      {
        id: 'action',
        header: 'Hành động',
        cell: ({ row }) => {
          const file = row.original
          const isClaiming = claimingFileUid === file.uid

          if (file.isUnassigned) {
            return (
              <Button
                type="button"
                size="sm"
                disabled={isClaiming}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => handleClaimFile(file)}
              >
                {isClaiming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FilePenLine className="mr-2 h-4 w-4" />
                )}
                Nhận file
              </Button>
            )
          }

          return (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(`/file/${file.uid}`)}
            >
              <Eye className="mr-2 h-4 w-4" /> View file
            </Button>
          )
        },
      },
    ],
    [claimingFileUid, navigate]
  )

  const table = useReactTable({
    data: files,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="bg-white pl-9 font-semibold text-slate-900"
                    placeholder="Tìm tên file..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <StatsCard title="Tổng hồ sơ" value={files.length} />
            <StatsCard
              title="Hồ sơ chờ lấy"
              value={unassignedFilesCount}
              loading={loadingUnassignedFilesCount}
              className="border-amber-200 bg-amber-50"
            />
          </div>
        </section>

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
                    <td
                      colSpan={columns.length}
                      className="px-6 py-10 text-center"
                    >
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
      </div>
    </main>
  )
}
