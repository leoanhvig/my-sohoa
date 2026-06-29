import { useCallback, useEffect, useState } from 'react'
import { FileRecord, getDashboardFilesByUser } from '../apis/file'

export interface DashboardFile extends FileRecord {
  isClaimedByCurrentUser: boolean
  isUnassigned: boolean
  is_completed?: boolean
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
      const dashboardFiles = fileRecords.map((file) => ({
        ...file,
        is_completed:
          file.is_completed ||
          (file.number_of_file > 0 &&
            (file.number_of_file_done || 0) >= file.number_of_file),
        isClaimedByCurrentUser: file.enteredByUserId === userUid,
        isUnassigned: !file.enteredByUserId,
      }))

      setFiles(dashboardFiles)
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
