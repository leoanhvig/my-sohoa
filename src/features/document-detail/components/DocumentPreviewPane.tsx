import type { DocumentRecord } from '@/apis/document'
import { getLocalFileContentUrl } from '@/apis/storage'
import { FileText, Loader2 } from 'lucide-react'
import { StatusMessage } from './StatusMessage'

type DocumentPreviewPaneProps = {
  documentRecord?: DocumentRecord | null
  previewUrl: string
  isLoading: boolean
  error: unknown
}

type PreviewKind = 'pdf' | 'unknown'

function getPreviewKind(documentRecord?: DocumentRecord | null): PreviewKind {
  const fileName = documentRecord?.file_name?.toLowerCase() || ''
  const url = documentRecord?.download_url?.toLowerCase() || ''

  if (fileName.endsWith('.pdf') || url.includes('.pdf')) {
    return 'pdf'
  }

  return 'unknown'
}

function getPdfSourceUrl(documentRecord: DocumentRecord, previewUrl: string) {
  if (documentRecord.storage_path) {
    return getLocalFileContentUrl(documentRecord.storage_path)
  }

  return documentRecord.download_url || previewUrl
}

export function DocumentPreviewPane({
  documentRecord,
  previewUrl,
  isLoading,
  error,
}: DocumentPreviewPaneProps) {
  const previewKind = getPreviewKind(documentRecord)
  const pdfSourceUrl = documentRecord
    ? getPdfSourceUrl(documentRecord, previewUrl)
    : ''
  const canRenderPdfViewer = previewKind === 'pdf' && Boolean(pdfSourceUrl)
  const nativePdfUrl = pdfSourceUrl
    ? `${pdfSourceUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&action=download`
    : ''
  const iframePdfUrl = pdfSourceUrl ? `${pdfSourceUrl}#toolbar=0` : ''

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

        {!isLoading && !error && !documentRecord && (
          <StatusMessage tone="warning" message="Không tìm thấy hồ sơ." />
        )}

        {documentRecord && previewUrl && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
              <FileText className="h-4 w-4" />
              <span>{documentRecord.file_name || 'Document preview'}</span>
            </div>

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
                      title={documentRecord.file_name || 'Document preview'}
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

        {documentRecord && !previewUrl && (
          <StatusMessage
            tone="warning"
            message="Hồ sơ chưa có đường dẫn xem trước."
          />
        )}
      </>
    </section>
  )
}
