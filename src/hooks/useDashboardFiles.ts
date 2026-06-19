import { useCallback, useEffect, useState } from 'react'
import { DocumentRecord, getDocumentsByEnteredUser } from '../apis/document'

export interface DashboardFile extends DocumentRecord {
  isClaimedByCurrentUser: boolean
  isUnassigned: boolean
}

export function useDashboardFiles(userUid?: string) {
  const [files, setFiles] = useState<DashboardFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchFiles = useCallback(async () => {
    if (!userUid) {
      setFiles([])
      return
    }

    try {
      setLoading(true)
      setError('')

      const documentRecords = await getDocumentsByEnteredUser(userUid)
      const filesWithCompletedCount = documentRecords.map((document) => ({
        ...document,
        isClaimedByCurrentUser: document.enteredByUserId === userUid,
        isUnassigned: !document.enteredByUserId,
      }))

      setFiles(filesWithCompletedCount)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load files.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [userUid])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return {
    files,
    loading,
    error,
    refetch: fetchFiles,
  }
}
