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

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
}

export function getPdfUploadApiBaseUrl(): string {
  return import.meta.env.VITE_PDF_SERVER_URL || 'http://localhost:3000'
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
  const apiBaseUrl = getPdfUploadApiBaseUrl()

  return Promise.all(
    files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${apiBaseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Không upload được file ${file.name}.`)
      }

      return {
        originalName: file.name,
        fileName: data.filename,
        storagePath: data.filename,
        downloadUrl: data.url,
        size: data.size,
        mimeType: file.type || 'application/pdf',
      }
    })
  )
}
