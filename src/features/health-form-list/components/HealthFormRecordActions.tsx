import { deleteHealthFormRecord, HealthFormRecord } from '@/apis/healthForm'
import { Button } from '@/Components/ui/button'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useUserStore } from '@/stores/userStore'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Loader2, Pencil, Trash2 } from 'lucide-react'
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
  const queryClient = useQueryClient()
  const { showError, showTypedToast } = useToast()
  const authUser = useUserStore((state) => state.authUser)
  const [viewRecord, setViewRecord] = useState<HealthFormRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const isViewingCurrentUser = selectedCreator === authUser?.uid

  async function handleDeleteRecord() {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa record HealthForm này không?'
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      await deleteHealthFormRecord(record.uid)
      await queryClient.invalidateQueries({ queryKey: ['health-form'] })
      showTypedToast(EToastTypes.SUCCESS, 'Đã xóa record HealthForm')
    } catch (error) {
      showError('Không xóa được record HealthForm. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

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

        {isViewingCurrentUser ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleDeleteRecord}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Xóa
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
