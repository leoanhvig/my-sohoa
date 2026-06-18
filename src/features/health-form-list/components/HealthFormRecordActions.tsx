import { HealthFormRecord } from '@/apis/healthForm'
import { Button } from '@/Components/ui/button'
import { useUserStore } from '@/stores/userStore'
import { Eye, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HealthFormRecordActionsProps {
  record: HealthFormRecord
  selectedCreator: string
  onViewRecord: (record: HealthFormRecord) => void
}

export function HealthFormRecordActions({
  record,
  selectedCreator,
  onViewRecord,
}: HealthFormRecordActionsProps) {
  const navigate = useNavigate()
  const authUser = useUserStore((state) => state.authUser)
  const isViewingCurrentUser = selectedCreator === authUser?.uid

  if (isViewingCurrentUser) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => navigate(`/health-form?recordId=${record.uid}`)}
      >
        <Pencil className="mr-2 h-4 w-4" /> Cập nhật
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => onViewRecord(record)}
    >
      <Eye className="mr-2 h-4 w-4" /> View data
    </Button>
  )
}
