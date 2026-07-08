import { deleteFileRecord } from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteFileRecord() {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteFileRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['documents', 'total-count'] })
      showTypedToast(EToastTypes.SUCCESS, 'Đã xóa file')
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không xóa được file. Vui lòng thử lại.'
      )
    },
  })

  return {
    deleteFileRecord: mutation.mutateAsync,
    deletingFileUid: mutation.variables || '',
    isDeletingFileRecord: mutation.isPending,
  }
}