import { auth } from '../firebase'

export interface SyncDriveFolderParams {
  folderUrl: string
  folderName?: string
}

export interface SyncDriveFolderResponse {
  fileRecordUid: string
  folderName: string
  driveFolderId: string
  totalFiles: number
  createdDocuments: number
  skippedDocuments: number
}

export function getDriveFileContentUrl(fileId: string): string {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

  return `${apiBaseUrl}/api/drive/files/${encodeURIComponent(fileId)}/content`
}

export async function getAuthorizationHeader(): Promise<
  Record<string, string>
> {
  const token = await auth.currentUser?.getIdToken()

  if (!token) {
    throw new Error('You must be logged in to load Google Drive file content.')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export function extractDriveFolderId(input: string): string {
  const trimmedInput = input.trim()
  const folderMatch = trimmedInput.match(/\/folders\/([a-zA-Z0-9_-]+)/)

  if (folderMatch?.[1]) {
    return folderMatch[1]
  }

  return trimmedInput.split('?')[0]
}

export async function syncDriveFolder({
  folderUrl,
  folderName,
}: SyncDriveFolderParams): Promise<SyncDriveFolderResponse> {
  const token = await auth.currentUser?.getIdToken()

  if (!token) {
    throw new Error('You must be logged in to sync Google Drive folder.')
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const response = await fetch(`${apiBaseUrl}/api/drive/sync-folder`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      folderUrl,
      folderName,
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to sync Google Drive folder.')
  }

  return data as SyncDriveFolderResponse
}
