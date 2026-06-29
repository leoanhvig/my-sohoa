import type { FileRecord } from '@/apis/file'

export function getPreviewUrl(fileRecord?: FileRecord | null) {
  if (!fileRecord) {
    return ''
  }

  return fileRecord.download_url || ''
}
