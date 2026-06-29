import type { FileRecord } from '@/apis/file'
import { getLocalFileContentUrl } from '@/apis/storage'
import { Loader2 } from 'lucide-react'
import { StatusMessage } from './StatusMessage'

type DocumentPreviewPaneProps = {
  fileRecord?: FileRecord | null
  previewUrl: string
  isLoading: boolean
  error: unknown
  page?: number | string
}

type PreviewKind = 'pdf' | 'unknown'

function getPreviewKind(fileRecord?: FileRecord | null): PreviewKind {
  const fileName = fileRecord?.file_name?.toLowerCase() || ''
  const url = fileRecord?.download_url?.toLowerCase() || ''

  if (fileName.endsWith('.pdf') || url.includes('.pdf')) {
    return 'pdf'
  }

  return 'unknown'
}

function getPdfSourceUrl(fileRecord: FileRecord, previewUrl: string) {
  if (fileRecord.storage_path) {
    return getLocalFileContentUrl(fileRecord.storage_path)
  }

  return fileRecord.download_url || previewUrl
}

export function DocumentPreviewPane({
  fileRecord,
  previewUrl,
  isLoading,
  error,
  page = 0,
}: DocumentPreviewPaneProps) {
  const previewKind = getPreviewKind(fileRecord)
  const pdfSourceUrl = fileRecord ? getPdfSourceUrl(fileRecord, previewUrl) : ''
  const previewPage = page || 0
  const canRenderPdfViewer = previewKind === 'pdf' && Boolean(pdfSourceUrl)
  const nativePdfUrl = pdfSourceUrl
    ? `${pdfSourceUrl}#toolbar=1&navpanes=1&scrollbar=1&statusbar=1&messages=1&page=${previewPage}`
    : ''
  const iframePdfUrl = pdfSourceUrl
    ? `${pdfSourceUrl}#toolbar=1&navpanes=1&page=${previewPage}`
    : ''

  return (
    <section className="flex min-h-[45vh] flex-col border-r border-slate-300 bg-slate-500 md:min-h-0">
      <>
        {isLoading && (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải file...
          </div>
        )}

        {error && (
          <StatusMessage
            tone="error"
            message="Không tải được thông tin hồ sơ."
          />
        )}

        {!isLoading && !error && !fileRecord && (
          <StatusMessage tone="warning" message="Không tìm thấy hồ sơ." />
        )}

        {fileRecord && previewUrl && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 bg-slate-600">
              {canRenderPdfViewer ? (
                <div className="h-full min-h-[70vh] bg-slate-700">
                  <object
                    data={nativePdfUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="h-full min-h-[70vh] w-full bg-white"
                  >
                    <iframe
                      title={fileRecord.file_name || 'Document preview'}
                      src={iframePdfUrl}
                      width="100%"
                      height="100%"
                      className="h-full min-h-[70vh] w-full border-0 bg-white"
                    />
                  </object>
                </div>
              ) : (
                <StatusMessage
                  tone="warning"
                  message="File này không phải PDF hoặc chưa có đường dẫn PDF."
                />
              )}
            </div>
          </div>
        )}

        {fileRecord && !previewUrl && (
          <StatusMessage
            tone="warning"
            message="Hồ sơ chưa có đường dẫn xem trước."
          />
        )}
      </>
    </section>
  )
}
