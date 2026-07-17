import { updateFileRecordInfo, type UpdateFileRecordParams } from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateFileRecord() {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (fileRecord: UpdateFileRecordParams) =>
      updateFileRecordInfo(fileRecord),
    onSuccess: (_, fileRecord) => {
      queryClient.invalidateQueries({
        queryKey: ['files', 'detail', fileRecord.uid],
      })
      queryClient.invalidateQueries({ queryKey: ['files', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['files', 'dashboard'] })
      queryClient.invalidateQueries({
        queryKey: ['files', 'uncompleted-count'],
      })
      showTypedToast(EToastTypes.SUCCESS, 'Đã cập nhật thông tin File')
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không cập nhật được thông tin File. Vui lòng thử lại.'
      )
    },
  })

  return {
    updateFileRecord: mutation.mutateAsync,
    isUpdatingFileRecord: mutation.isPending,
  }
}
