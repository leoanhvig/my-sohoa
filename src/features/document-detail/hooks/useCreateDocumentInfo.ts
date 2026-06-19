import { createDocumentInfoRecord, type DocumentRecord } from '@/apis/document'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useUserStore } from '@/stores/userStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { DocumentRecordFormValues } from '../types'

type CreateDocumentInfoInput = {
  documentRecord: DocumentRecord
  values: DocumentRecordFormValues
}

export function useCreateDocumentInfo() {
  const authUser = useUserStore((state) => state.authUser)
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ documentRecord, values }: CreateDocumentInfoInput) => {
      if (!authUser?.uid) {
        throw new Error('Bạn cần đăng nhập trước khi lưu record.')
      }

      return createDocumentInfoRecord({
        documentUid: documentRecord.uid,
        uidFile: documentRecord.uid_file,
        fileName: documentRecord.file_name,
        relativePath: documentRecord.relative_path,
        creator: authUser.uid,
        soKyHieu: values.soKyHieu,
        ngayThang: values.ngayThang,
        tacGia: values.tacGia,
        trichYeu: values.trichYeu,
        soTo: values.soTo,
      })
    },
    onSuccess: (_, { documentRecord }) => {
      queryClient.invalidateQueries({
        queryKey: ['DocumentDetails', documentRecord.uid],
      })
      showTypedToast(EToastTypes.SUCCESS, 'Đã lưu record hồ sơ')
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không lưu được record hồ sơ. Vui lòng thử lại.'
      )
    },
  })

  return {
    createDocumentInfo: mutation.mutateAsync,
    isCreatingDocumentInfo: mutation.isPending,
  }
}
