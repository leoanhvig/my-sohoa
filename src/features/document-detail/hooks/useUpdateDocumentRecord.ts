import {
  updateDocumentRecordInfo,
  type UpdateDocumentRecordInfoParams,
} from '@/apis/document'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateDocumentRecord() {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (documentRecord: UpdateDocumentRecordInfoParams) =>
      updateDocumentRecordInfo(documentRecord),
    onSuccess: (_, documentRecord) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', documentRecord.uid],
      })
      showTypedToast(EToastTypes.SUCCESS, 'Đã cập nhật thông tin PDF')
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không cập nhật được thông tin PDF. Vui lòng thử lại.'
      )
    },
  })

  return {
    updateDocumentRecord: mutation.mutateAsync,
    isUpdatingDocumentRecord: mutation.isPending,
  }
}
