import { getDocumentByUid } from '@/apis/document'

export function getPreviewUrl(
  documentRecord: Awaited<ReturnType<typeof getDocumentByUid>> | undefined
) {
  if (!documentRecord) {
    return ''
  }

  if (documentRecord.drive_file_id) {
    return `https://drive.google.com/file/d/${documentRecord.drive_file_id}/preview`
  }

  return documentRecord.download_url || documentRecord.drive_web_view_link || ''
}
