import { HealthFormRecord } from '@/apis/healthForm'
import { Button } from '@/Components/ui/button'
import { useUserStore } from '@/stores/userStore'
import { Eye, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HealthFormRecordDialog } from './HealthFormRecordDialog'

interface HealthFormRecordActionsProps {
  record: HealthFormRecord
  selectedCreator: string
}

export function HealthFormRecordActions({
  record,
  selectedCreator,
}: HealthFormRecordActionsProps) {
  const navigate = useNavigate()
  const authUser = useUserStore((state) => state.authUser)
  const [viewRecord, setViewRecord] = useState<HealthFormRecord | null>(null)
  const isViewingCurrentUser = selectedCreator === authUser?.uid

  return (
    <>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setViewRecord(record)}
        >
          <Eye className="mr-2 h-4 w-4" /> View data
        </Button>

        {isViewingCurrentUser ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => navigate(`/health-form/update/${record.uid}`)}
          >
            <Pencil className="mr-2 h-4 w-4" /> Cập nhật
          </Button>
        ) : null}
      </div>

      <HealthFormRecordDialog
        record={viewRecord}
        onOpenChange={(open) => {
          if (!open) setViewRecord(null)
        }}
      />
    </>
  )
}
