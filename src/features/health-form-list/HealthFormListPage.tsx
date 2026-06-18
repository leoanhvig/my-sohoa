import { Button } from '@/Components/ui/button'
import { useHealthFormRecords } from '@/hooks/useHealthFormRecords'
import { useUserStore } from '@/stores/userStore'
import { useEffect, useMemo, useState } from 'react'
import { HealthFormListHeader } from './components/HealthFormListHeader'
import { HealthFormRecordsTable } from './components/HealthFormRecordsTable'
import { UserSelectHeader } from './components/UserSelectHeader'
import { useExportHealthFormExcel } from './hooks/useExportHealthFormExcel'

const RECORDS_PER_PAGE = 15

export default function HealthFormListPage() {
  const authUser = useUserStore((state) => state.authUser)
  const { exportAllHealthForms, isExporting } = useExportHealthFormExcel()
  const [selectedCreator, setSelectedCreator] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const effectiveCreator = selectedCreator || authUser?.uid || ''
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
          <UserSelectHeader
            selectedCreator={selectedCreator}
            onSelectedCreatorChange={setSelectedCreator}
          />
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={exportAllHealthForms}
            disabled={isExporting}
          >
            {isExporting ? 'Đang export...' : 'Export Excel'}
          </Button>
        </div>
        <HealthFormRecordsTable
          records={paginatedRecords}
          selectedCreator={selectedCreator}
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
