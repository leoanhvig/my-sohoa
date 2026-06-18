import { HealthFormRecord } from '@/apis/healthForm'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { formatValue, getRecordColumns } from '../utils'
import { HealthFormRecordActions } from './HealthFormRecordActions'

interface HealthFormRecordsTableProps {
  records: HealthFormRecord[]
  selectedCreator: string
  isLoading: boolean
  error: unknown
  onViewRecord: (record: HealthFormRecord) => void
}

export function HealthFormRecordsTable({
  records,
  selectedCreator,
  isLoading,
  error,
  onViewRecord,
}: HealthFormRecordsTableProps) {
  const tableColumns = useMemo<ColumnDef<HealthFormRecord>[]>(() => {
    const dynamicColumns = getRecordColumns(records).map<
      ColumnDef<HealthFormRecord>
    >((column) => ({
      id: column.field,
      accessorFn: (record) => record[column.field],
      header: column.title,
      cell: ({ row }) => (
        <span title={formatValue(row.original[column.field])}>
          {formatValue(row.original[column.field])}
        </span>
      ),
    }))

    return [
      {
        id: 'action',
        header: () => <label>Hành động</label>,
        cell: ({ row }) => (
          <HealthFormRecordActions
            record={row.original}
            selectedCreator={selectedCreator}
            onViewRecord={onViewRecord}
          />
        ),
      },
      ...dynamicColumns,
    ]
  }, [onViewRecord, records, selectedCreator])
  const table = useReactTable({
    data: records,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <>
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
      </>
    </section>
  )
}
