import {
  updateFileRecordInfo,
  updateHoTichFileRecordInfo,
  type UpdateFileRecordParams,
} from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateFileRecord(
  collection: 'files' | 'ho-tich' = 'files'
) {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (fileRecord: UpdateFileRecordParams) =>
      collection === 'ho-tich'
        ? updateHoTichFileRecordInfo(fileRecord)
        : updateFileRecordInfo(fileRecord),
    onSuccess: (_, fileRecord) => {
      const queryPrefix = collection === 'ho-tich' ? 'ho-tich-files' : 'files'
      queryClient.invalidateQueries({
        queryKey: [queryPrefix, 'detail', fileRecord.uid],
      })
      queryClient.invalidateQueries({ queryKey: [queryPrefix, 'all'] })
      if (collection === 'files') {
        queryClient.invalidateQueries({ queryKey: ['files', 'dashboard'] })
        queryClient.invalidateQueries({
          queryKey: ['files', 'uncompleted-count'],
        })
      }
      showTypedToast(
        EToastTypes.SUCCESS,
        collection === 'ho-tich'
          ? 'Đã cập nhật thông tin Hộ tịch'
          : 'Đã cập nhật thông tin File'
      )
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
