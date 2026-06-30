import {
  deleteHealthFormRecord,
  getHealthFormRecordsByCreator,
  getHealthFormRecordsByCreatorAndExamInfo,
  HealthFormRecord,
} from '@/apis/healthForm2'
import { Button } from '@/Components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { HealthFormRecordDialog } from '@/features/health-form-list/components/HealthFormRecordDialog'
import { useUserStore } from '@/stores/userStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RECORDS_PER_PAGE = 100
const CLINIC_LOCATION_OPTIONS = [
  'Nhà VH Lao Động Thuận An',
  'Nhà VH Lao Động Bến Cát',
  'Nhà VH Lao Động Phú Mỹ',
]
const EXAM_DATE_OPTIONS = ['23/5/26', '24/5/26', '30/5/26', '31/5/26']
const HEALTH_FORM_2_COLUMNS = [
  { title: 'STT/Mã Bệnh Nhân', field: 'patientCode' },
  { title: 'Địa điểm', field: 'clinicLocation' },
  { title: 'Ngày khám', field: 'examDate' },
  { title: 'Họ tên', field: 'fullName' },
  { title: 'Giới tính', field: 'gender' },
  { title: 'Ngày sinh', field: 'birthDate' },
  { title: 'Số CCCD', field: 'citizenId' },
  { title: 'Số thẻ BHYT', field: 'healthInsuranceNumber' },
  { title: 'Nghề nghiệp', field: 'occupation' },
  { title: 'Khu phố/Ấp', field: 'hamlet' },
  { title: 'Xã/Phường/Đặc khu', field: 'ward' },
  { title: 'Tỉnh/TP', field: 'provinceCity' },
  { title: 'Số điện thoại', field: 'phoneNumber' },
  { title: 'Kết quả AI', field: 'aiResult' },
  { title: 'Hướng xử trí', field: 'treatmentPlan' },
  { title: 'Nhận xét của Bác Sĩ', field: 'doctorComment' },
]
const HEALTH_FORM_2_FIELD_TITLES = HEALTH_FORM_2_COLUMNS.map(
  (column) => column.title
)
const HEALTH_FORM_2_FIELD_NAME_BY_TITLE = HEALTH_FORM_2_COLUMNS.reduce<
  Record<string, string>
>((result, column) => {
  result[column.title] = column.field
  return result
}, {})

type TimestampLike = {
  toDate: () => Date
}

function hasToDate(value: unknown): value is TimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (hasToDate(value)) return value.toDate().toLocaleString('vi-VN')
  if (typeof value === 'object') return JSON.stringify(value)

  return String(value)
}

function getCreatedAtTime(value: unknown): number {
  if (hasToDate(value)) return value.toDate().getTime()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return new Date(value).getTime()

  return 0
}

function useHealthForm2Records(creator?: string) {
  return useQuery({
    queryKey: ['health-form-2', 'records', creator],
    queryFn: () => getHealthFormRecordsByCreator(creator || ''),
    enabled: Boolean(creator),
    staleTime: 3 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export default function HealthForm2List() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authUser = useUserStore((state) => state.authUser)
  const { showError, showTypedToast } = useToast()
  const [selectedClinicLocation, setSelectedClinicLocation] = useState('')
  const [selectedExamDate, setSelectedExamDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [viewRecord, setViewRecord] = useState<HealthFormRecord | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState('')
  const effectiveCreator = authUser?.uid || ''
  const {
    data: records = [],
    isLoading,
    error,
  } = useHealthForm2Records(effectiveCreator)
  const totalPages = Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE))
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE

    return records.slice(startIndex, startIndex + RECORDS_PER_PAGE)
  }, [currentPage, records])
  const startRecord =
    records.length === 0 ? 0 : (currentPage - 1) * RECORDS_PER_PAGE + 1
  const endRecord = Math.min(currentPage * RECORDS_PER_PAGE, records.length)

  useEffect(() => {
    setCurrentPage(1)
  }, [effectiveCreator])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  async function handleExportExcel() {
    if (!effectiveCreator) {
      showError('Bạn cần đăng nhập trước khi export.')
      return
    }

    if (!selectedClinicLocation || !selectedExamDate) {
      showError('Vui lòng chọn địa điểm khám và ngày khám để export.')
      return
    }

    setIsExporting(true)

    try {
      const [exportRecords, XLSX] = await Promise.all([
        getHealthFormRecordsByCreatorAndExamInfo({
          creator: effectiveCreator,
          clinicLocation: selectedClinicLocation,
          examDate: selectedExamDate,
        }),
        import('xlsx'),
      ])

      if (exportRecords.length === 0) {
        showError('Không có dữ liệu HealthForm2 theo địa điểm và ngày đã chọn.')
        return
      }

      const sortedRecords = [...exportRecords].sort(
        (recordA, recordB) =>
          getCreatedAtTime(recordA.created_at) -
          getCreatedAtTime(recordB.created_at)
      )
      const rows = sortedRecords.map((record) =>
        HEALTH_FORM_2_COLUMNS.map((column) => formatValue(record[column.field]))
      )
      const worksheet = XLSX.utils.aoa_to_sheet([
        HEALTH_FORM_2_COLUMNS.map((column) => column.title),
        ...rows,
      ])
      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(workbook, worksheet, 'HealthForm2')
      XLSX.writeFile(
        workbook,
        `healthform2-${selectedClinicLocation}-${selectedExamDate}.xlsx`.replace(
          /[\\/:*?"<>|]/g,
          '-'
        )
      )
      showTypedToast(EToastTypes.SUCCESS, 'Đã export dữ liệu HealthForm2')
    } catch (exportError) {
      showError('Không export được dữ liệu HealthForm2. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  async function handleDeleteRecord(recordId: string) {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa record HealthForm2 này không?'
    )

    if (!confirmed) return

    setDeletingRecordId(recordId)

    try {
      await deleteHealthFormRecord(recordId)
      await queryClient.invalidateQueries({ queryKey: ['health-form-2'] })
      showTypedToast(EToastTypes.SUCCESS, 'Đã xóa record HealthForm2')
    } catch (deleteError) {
      showError('Không xóa được record HealthForm2. Vui lòng thử lại.')
    } finally {
      setDeletingRecordId('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Tổng dữ liệu HealthForm2 bạn đã nhập
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-indigo-700">
                {records.length}
              </span>
              <span className="pb-1 text-sm font-semibold text-slate-500">
                record
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Trang hiện tại
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-emerald-700">
                {currentPage}/{totalPages}
              </span>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
          <Select
            value={selectedClinicLocation}
            onValueChange={setSelectedClinicLocation}
          >
            <SelectTrigger className="w-full bg-white sm:w-72">
              <SelectValue placeholder="Chọn địa điểm khám" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="w-72">
              {CLINIC_LOCATION_OPTIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedExamDate} onValueChange={setSelectedExamDate}>
            <SelectTrigger className="w-full bg-white sm:w-44">
              <SelectValue placeholder="Chọn ngày khám" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="w-44">
              {EXAM_DATE_OPTIONS.map((examDate) => (
                <SelectItem key={examDate} value={examDate}>
                  {examDate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            {isExporting ? 'Đang export...' : 'Export Excel'}
          </Button>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {error ? (
            <div className="m-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error instanceof Error
                ? error.message
                : 'Không thể tải danh sách HealthForm2.'}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left align-top font-bold text-slate-600">
                    Hành động
                  </th>
                  {HEALTH_FORM_2_COLUMNS.map((column) => (
                    <th
                      key={column.field}
                      className="whitespace-nowrap px-4 py-3 text-left font-bold text-slate-600"
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={HEALTH_FORM_2_COLUMNS.length + 1}
                      className="px-6 py-10 text-center"
                    >
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                      </span>
                    </td>
                  </tr>
                ) : paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record: HealthFormRecord) => (
                    <tr
                      key={record.uid}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="sticky left-0 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setViewRecord(record)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View data
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/health-form-2/update/${record.uid}`)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Update
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteRecord(record.uid)}
                            disabled={deletingRecordId === record.uid}
                          >
                            {deletingRecordId === record.uid ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </td>
                      {HEALTH_FORM_2_COLUMNS.map((column) => (
                        <td
                          key={column.field}
                          className="max-w-xs truncate whitespace-nowrap px-4 py-3 font-medium text-slate-700"
                          title={formatValue(record[column.field])}
                        >
                          {formatValue(record[column.field])}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={HEALTH_FORM_2_COLUMNS.length + 1}
                      className="px-6 py-10 text-center font-semibold text-slate-500"
                    >
                      Chưa có record HealthForm2 nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Hiển thị {startRecord}-{endRecord} / {records.length} record
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={isLoading || currentPage <= 1}
              >
                Prev
              </Button>
              <span className="font-semibold text-slate-700">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={isLoading || currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        <HealthFormRecordDialog
          record={viewRecord}
          title="View HealthForm2 data"
          fieldTitles={HEALTH_FORM_2_FIELD_TITLES}
          fieldNameByTitle={HEALTH_FORM_2_FIELD_NAME_BY_TITLE}
          onOpenChange={(open) => {
            if (!open) setViewRecord(null)
          }}
        />
      </div>
    </main>
  )
}
