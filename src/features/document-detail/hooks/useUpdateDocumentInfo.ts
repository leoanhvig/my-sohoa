import {
  updateDocumentInfoRecord,
  type UpdateDocumentInfoParams,
} from '@/apis/document'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateDocumentInfo() {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (documentDetail: UpdateDocumentInfoParams) =>
      updateDocumentInfoRecord(documentDetail),
    onSuccess: (_, documentDetail) => {
      queryClient.invalidateQueries({
        queryKey: ['DocumentDetails', documentDetail.documentUid],
      })
      showTypedToast(EToastTypes.SUCCESS, 'Đã cập nhật document detail')
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không cập nhật được document detail. Vui lòng thử lại.'
      )
    },
  })

  return {
    updateDocumentInfo: mutation.mutateAsync,
    isUpdatingDocumentInfo: mutation.isPending,
  }
}
