import { Button } from '@/Components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select'
import { useHealthFormRecords } from '@/hooks/useHealthFormRecords'
import { useUserStore } from '@/stores/userStore'
import { useEffect, useMemo, useState } from 'react'
import { HealthFormListHeader } from './components/HealthFormListHeader'
import { HealthFormRecordsTable } from './components/HealthFormRecordsTable'
import { useExportHealthFormExcel } from './hooks/useExportHealthFormExcel'

const RECORDS_PER_PAGE = 100
const CLINIC_LOCATION_OPTIONS = [
  'Nhà VH Lao Động TP. Thủ Đức',
  'Nhà VH Lao Động Củ Chi',
  'Nhà VH Lao Động Khu CNC',
]
const EXAM_DATE_OPTIONS = ['9/5/26', '10/5/26', '16/5/26', '17/5/26']

export default function HealthFormListPage() {
  const authUser = useUserStore((state) => state.authUser)
  const { exportHealthFormsByFilters, isExporting } = useExportHealthFormExcel()
  const [selectedClinicLocation, setSelectedClinicLocation] = useState('')
  const [selectedExamDate, setSelectedExamDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const effectiveCreator = authUser?.uid || ''
  const {
    data: records = [],
    isLoading,
    error,
  } = useHealthFormRecords(effectiveCreator)
  const totalPages = Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE))
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE

    return records.slice(startIndex, startIndex + RECORDS_PER_PAGE)
  }, [currentPage, records])

  useEffect(() => {
    setCurrentPage(1)
  }, [effectiveCreator])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <HealthFormListHeader />
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
            onClick={() =>
              exportHealthFormsByFilters({
                creator: effectiveCreator,
                clinicLocation: selectedClinicLocation,
                examDate: selectedExamDate,
              })
            }
            disabled={isExporting}
          >
            {isExporting ? 'Đang export...' : 'Export Excel'}
          </Button>
        </div>
        <HealthFormRecordsTable
          records={paginatedRecords}
          selectedCreator={effectiveCreator}
          isLoading={isLoading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={records.length}
          recordsPerPage={RECORDS_PER_PAGE}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>
    </main>
  )
}
