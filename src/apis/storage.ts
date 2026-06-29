import { auth } from '../firebase'
import { getApiBaseUrl } from './drive'

export interface UploadPdfFilesParams {
  files: File[]
}

export interface UploadedPdfFile {
  originalName: string
  fileName: string
  storagePath: string
  downloadUrl: string
  size: number
  mimeType: string
}

export function getLocalFileContentUrl(storagePath: string): string {
  return `${getApiBaseUrl()}/uploads/${encodeURIComponent(storagePath).replace(
    /%2F/g,
    '/'
  )}`
}

export async function uploadPdfFiles({
  files,
}: UploadPdfFilesParams): Promise<UploadedPdfFile[]> {
  const token = await auth.currentUser?.getIdToken()

  if (!token) {
    throw new Error('Bạn cần đăng nhập để upload PDF.')
  }

  const apiBaseUrl = getApiBaseUrl()
  const formData = new FormData()

  for (const file of files) {
    formData.append('files', file)
  }

  const response = await fetch(`${apiBaseUrl}/api/local-files/upload-pdfs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Không upload được file PDF.')
  }

  return data.files as UploadedPdfFile[]
}
