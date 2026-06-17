import { HealthFormRecord } from '@/apis/healthForm'
import { Button } from '@/Components/ui/button'
import { useUserStore } from '@/stores/userStore'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, Loader2, Pencil } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatValue, getRecordColumns } from '../utils'
import { UserSelectHeader } from './UserSelectHeader'

interface HealthFormRecordsTableProps {
  records: HealthFormRecord[]
  selectedCreator: string
  isLoading: boolean
  error: unknown
  onSelectedCreatorChange: (value: string) => void
  onViewRecord: (record: HealthFormRecord) => void
}

export function HealthFormRecordsTable({
  records,
  selectedCreator,
  isLoading,
  error,
  onSelectedCreatorChange,
  onViewRecord,
}: HealthFormRecordsTableProps) {
  const navigate = useNavigate()
  const authUser = useUserStore((state) => state.authUser)
  const isViewingCurrentUser = selectedCreator === authUser?.uid
  const tableColumns = useMemo<ColumnDef<HealthFormRecord>[]>(() => {
    const dynamicColumns = getRecordColumns(records).map<
      ColumnDef<HealthFormRecord>
    >((column) => ({
      id: column,
      accessorFn: (record) => record[column],
      header: column,
      cell: ({ row }) => (
        <span title={formatValue(row.original[column])}>
          {formatValue(row.original[column])}
        </span>
      ),
    }))

    return [
      {
        id: 'action',
        header: () => (
          <UserSelectHeader onSelectedCreatorChange={onSelectedCreatorChange} />
        ),
        cell: ({ row }) =>
          isViewingCurrentUser ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                navigate(`/health-form?recordId=${row.original.uid}`)
              }
            >
              <Pencil className="mr-2 h-4 w-4" /> Cập nhật
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onViewRecord(row.original)}
            >
              <Eye className="mr-2 h-4 w-4" /> View data
            </Button>
          ),
      },
      ...dynamicColumns,
    ]
  }, [
    authUser?.uid,
    isViewingCurrentUser,
    navigate,
    onSelectedCreatorChange,
    onViewRecord,
    records,
    selectedCreator,
  ])
  const table = useReactTable({
    data: records,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {error && (
        <div className="m-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error instanceof Error
            ? error.message
            : 'Không thể tải danh sách HealthForm.'}
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
                        ? 'sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left align-top font-bold text-slate-600'
                        : 'whitespace-nowrap px-4 py-3 text-left font-bold text-slate-600'
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
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
                          ? 'sticky left-0 bg-white px-4 py-3'
                          : 'max-w-xs truncate whitespace-nowrap px-4 py-3 font-medium text-slate-700'
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
                  colSpan={tableColumns.length}
                  className="px-6 py-10 text-center font-semibold text-slate-500"
                >
                  Chưa có record HealthForm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
