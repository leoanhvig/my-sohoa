import {
  claimRandomUnenteredDocument,
  markDocumentAsDone,
} from '@/apis/document'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useUserStore } from '@/stores/userStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function useMarkDocumentDone(documentUid?: string) {
  const { showError, showTypedToast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const authUser = useUserStore((state) => state.authUser)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!documentUid) {
        throw new Error('Không tìm thấy document để chuyển trang.')
      }
      if (!authUser?.uid) {
        throw new Error('Bạn cần đăng nhập để nhận hồ sơ mới.')
      }

      await markDocumentAsDone(documentUid)
      return claimRandomUnenteredDocument(authUser.uid)
    },
    onSuccess: async (claimedDocument) => {
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
      showTypedToast(EToastTypes.SUCCESS, 'Đã chuyển trang')

      if (claimedDocument) {
        navigate(`/document/${claimedDocument.uid}`)
        return
      }

      showTypedToast(
        EToastTypes.INFO,
        'Không còn hồ sơ chưa phân công để nhận.'
      )
    },
    onError: (error) => {
      showError(
        error instanceof Error
          ? error.message
          : 'Không thể chuyển trang. Vui lòng thử lại.'
      )
    },
  })

  return {
    markDocumentDone: mutation.mutateAsync,
    isMarkingDocumentDone: mutation.isPending,
  }
}
