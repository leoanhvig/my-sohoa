import { claimRandomUnenteredDocument } from '@/apis/document'
import { useUserStore } from '@/stores/userStore'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useClaimRandomDocument() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authUser = useUserStore((state) => state.authUser)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState('')

  async function claimRandomDocument() {
    if (!authUser?.uid || isClaiming) {
      return
    }

    try {
      setError('')
      setIsClaiming(true)

      const claimedDocument = await claimRandomUnenteredDocument(authUser.uid)

      if (!claimedDocument) {
        setError('Không còn hồ sơ chưa phân công để nhận.')
        return
      }

      await queryClient.invalidateQueries({
        queryKey: ['documents'],
      })
      navigate(`/document/${claimedDocument.uid}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể nhận hồ sơ.'
      setError(message)
    } finally {
      setIsClaiming(false)
    }
  }

  return {
    claimRandomDocument,
    isClaiming,
    error,
  }
}
