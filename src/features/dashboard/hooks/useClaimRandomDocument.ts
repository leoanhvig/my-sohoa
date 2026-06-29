import { claimRandomUnenteredFile } from '@/apis/file'
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

      const claimedFile = await claimRandomUnenteredFile(authUser.uid)

      if (!claimedFile) {
        setError('Không còn hồ sơ chưa phân công để nhận.')
        return
      }

      await queryClient.invalidateQueries({
        queryKey: ['files'],
      })

      navigate(`/file/${claimedFile.uid}/documents`)
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
