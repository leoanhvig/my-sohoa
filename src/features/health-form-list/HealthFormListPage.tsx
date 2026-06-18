import { HealthFormRecord } from '@/apis/healthForm'
import { Button } from '@/Components/ui/button'
import {
  useHealthFormRecords,
  useHealthFormRecordsCount,
} from '@/hooks/useHealthFormRecords'
import { useUserStore } from '@/stores/userStore'
import { useState } from 'react'
import { HealthFormListHeader } from './components/HealthFormListHeader'
import { HealthFormRecordDialog } from './components/HealthFormRecordDialog'
import { HealthFormRecordsTable } from './components/HealthFormRecordsTable'
import { UserSelectHeader } from './components/UserSelectHeader'
import { useExportHealthFormExcel } from './hooks/useExportHealthFormExcel'

export default function HealthFormListPage() {
  const authUser = useUserStore((state) => state.authUser)
  const { exportAllHealthForms, isExporting } = useExportHealthFormExcel()
  const [selectedCreator, setSelectedCreator] = useState('')
  const [viewRecord, setViewRecord] = useState<HealthFormRecord | null>(null)
  const {
    data: records = [],
    isLoading,
    error,
  } = useHealthFormRecords(selectedCreator ?? authUser?.uid ?? '')
  const { data: currentUserRecordsCount = 0 } = useHealthFormRecordsCount(
    authUser?.uid
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <HealthFormListHeader
          currentUserRecordsCount={currentUserRecordsCount}
        />
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
          records={records}
          selectedCreator={selectedCreator}
          isLoading={isLoading}
          error={error}
          onSelectedCreatorChange={setSelectedCreator}
          onViewRecord={setViewRecord}
        />
      </div>

      <HealthFormRecordDialog
        record={viewRecord}
        onOpenChange={(open) => {
          if (!open) setViewRecord(null)
        }}
      />
    </main>
  )
}
