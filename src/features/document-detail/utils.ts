import { getDocumentByUid } from '@/apis/document'

export function getPreviewUrl(
  documentRecord: Awaited<ReturnType<typeof getDocumentByUid>> | undefined
) {
  if (!documentRecord) {
    return ''
  }

  return documentRecord.download_url || ''
}
