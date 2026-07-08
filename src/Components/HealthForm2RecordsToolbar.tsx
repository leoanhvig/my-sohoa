import {
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
import { useEffect, useState } from 'react'

const CLINIC_LOCATION_OPTIONS = [
  'Nhà VH Lao Động Thuận An',
  'Nhà VH Lao Động Bến Cát',
  'Nhà VH Lao Động Phú Mỹ',
]
const EXAM_DATE_OPTIONS = ['23/5/26', '24/5/26', '30/5/26', '31/5/26']
const HEALTH_FORM_2_EXPORT_COLUMNS = [
  { title: 'STT/Mã Bệnh Nhân', field: 'patientCode' },
  { title: 'họ tên', field: 'fullName' },
  { title: 'địa điểm khám', field: 'clinicLocation' },
  { title: 'ngày khám', field: 'examDate' },
  { title: 'Ngày sinh', field: 'birthDate' },
  { title: 'giới tính', field: 'gender' },
  { title: 'Số CCCD', field: 'citizenId' },
  { title: 'Số thẻ BHYT', field: 'healthInsuranceNumber' },
  { title: 'Nghề nghiệp', field: 'occupation' },
  { title: 'Khu phố/Ấp', field: 'hamlet' },
  { title: 'Xã/Phường/Đặc khu', field: 'ward' },
  { title: 'Tỉnh/TP', field: 'provinceCity' },
  { title: 'Số điện thoại', field: 'phoneNumber' },
  { title: 'Kết quả AI', field: 'aiResult' },
  { title: 'Nhận xét của Bác Sĩ', field: 'doctorComment' },
  { title: 'Hướng xử trí', field: 'treatmentPlan' },
]

type HealthForm2RecordsToolbarProps = {
  filterRecordsByExamInfo: boolean
  creator: string
  onFiltersChange: (filters: HealthForm2RecordsFilters) => void
}

export type HealthForm2RecordsFilters = {
  clinicLocation: string
  examDate: string
}

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

export default function HealthForm2RecordsToolbar({
  filterRecordsByExamInfo,
  creator,
  onFiltersChange,
}: HealthForm2RecordsToolbarProps) {
  const { showError, showTypedToast } = useToast()
  const [selectedClinicLocation, setSelectedClinicLocation] = useState('')
  const [selectedExamDate, setSelectedExamDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    onFiltersChange({
      clinicLocation: selectedClinicLocation,
      examDate: selectedExamDate,
    })
  }, [onFiltersChange, selectedClinicLocation, selectedExamDate])

  async function handleExportExcel() {
    if (!creator) {
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
          creator,
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
        (recordA: HealthFormRecord, recordB: HealthFormRecord) =>
          getCreatedAtTime(recordA.created_at) -
          getCreatedAtTime(recordB.created_at)
      )
      const rows = sortedRecords.map((record) =>
        HEALTH_FORM_2_EXPORT_COLUMNS.map((column) =>
          formatValue(record[column.field])
        )
      )
      const worksheet = XLSX.utils.aoa_to_sheet([
        HEALTH_FORM_2_EXPORT_COLUMNS.map((column) => column.title),
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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">
      {filterRecordsByExamInfo ? (
        <p className="mr-auto text-sm font-semibold text-slate-500">
          Danh sách đang order theo created_at mới nhất trước.
        </p>
      ) : null}
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
  )
}
