import {
  updateHoTichFileRecordInfo,
  type UpdateFileRecordParams,
} from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateHoTichFileRecord() {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (fileRecord: UpdateFileRecordParams) =>
      updateHoTichFileRecordInfo(fileRecord),
    onSuccess: (_, fileRecord) => {
      queryClient.invalidateQueries({
        queryKey: ['ho-tich-files', 'detail', fileRecord.uid],
      })
      queryClient.invalidateQueries({ queryKey: ['ho-tich-files', 'all'] })
      showTypedToast(EToastTypes.SUCCESS, 'Đã cập nhật thông tin Hộ tịch')
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không cập nhật được thông tin Hộ tịch. Vui lòng thử lại.'
      )
    },
  })

  return {
    updateHoTichFileRecord: mutation.mutateAsync,
    isUpdatingHoTichFileRecord: mutation.isPending,
  }
}