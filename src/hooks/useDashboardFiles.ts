import { useCallback, useEffect, useState } from 'react'
import { getCompletedDocumentCountByUidFile } from '../apis/document'
import { DashboardFileRecord, getDashboardFilesByUser } from '../apis/file'

export interface DashboardFile extends DashboardFileRecord {
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

      const fileRecords = await getDashboardFilesByUser(userUid)
      const filesWithCompletedCount = await Promise.all(
        fileRecords.map(async (file) => ({
          ...file,
          completed_file_count: await getCompletedDocumentCountByUidFile(
            file.uid
          ),
          isClaimedByCurrentUser: file.updated_uid === userUid,
          isUnassigned: !file.updated_uid,
        }))
      )

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
