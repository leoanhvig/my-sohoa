import type { DocumentRecord } from '@/apis/document'
import { getAuthorizationHeader, getDriveFileContentUrl } from '@/apis/drive'
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { FileText, Loader2 } from 'lucide-react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { useEffect, useState } from 'react'
import { StatusMessage } from './StatusMessage'

type DocumentPreviewPaneProps = {
  documentRecord?: DocumentRecord | null
  previewUrl: string
  isLoading: boolean
  error: unknown
}

type PreviewKind = 'pdf' | 'unknown'

function getPreviewKind(documentRecord?: DocumentRecord | null): PreviewKind {
  const mimeType = documentRecord?.drive_mime_type?.toLowerCase() || ''
  const fileName = documentRecord?.file_name?.toLowerCase() || ''
  const url = documentRecord?.download_url?.toLowerCase() || ''

  if (
    mimeType.includes('pdf') ||
    fileName.endsWith('.pdf') ||
    url.includes('.pdf')
  ) {
    return 'pdf'
  }

  return 'unknown'
}

function getPdfSourceUrl(documentRecord: DocumentRecord, previewUrl: string) {
  if (documentRecord.drive_file_id) {
    return getDriveFileContentUrl(documentRecord.drive_file_id)
  }

  return (
    documentRecord.download_url ||
    documentRecord.drive_download_link ||
    documentRecord.drive_web_view_link ||
    previewUrl
  )
}

export function DocumentPreviewPane({
  documentRecord,
  previewUrl,
  isLoading,
  error,
}: DocumentPreviewPaneProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  const [authorizationHeader, setAuthorizationHeader] = useState<
    Record<string, string>
  >({})
  const [authorizationError, setAuthorizationError] = useState('')
  const previewKind = getPreviewKind(documentRecord)
  const pdfSourceUrl = documentRecord
    ? getPdfSourceUrl(documentRecord, previewUrl)
    : ''
  const shouldUseDriveContentApi = Boolean(documentRecord?.drive_file_id)

  useEffect(() => {
    let isMounted = true

    async function loadAuthorizationHeader() {
      if (!shouldUseDriveContentApi) {
        setAuthorizationHeader({})
        setAuthorizationError('')
        return
      }

      try {
        const headers = await getAuthorizationHeader()

        if (isMounted) {
          setAuthorizationHeader(headers)
          setAuthorizationError('')
        }
      } catch (authError) {
        if (isMounted) {
          setAuthorizationHeader({})
          setAuthorizationError(
            authError instanceof Error
              ? authError.message
              : 'Không lấy được token để tải file Drive.'
          )
        }
      }
    }

    loadAuthorizationHeader()

    return () => {
      isMounted = false
    }
  }, [shouldUseDriveContentApi])

  const canRenderPdfViewer =
    previewKind === 'pdf' &&
    pdfSourceUrl &&
    (!shouldUseDriveContentApi || Boolean(authorizationHeader.Authorization))

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
              {authorizationError && (
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-amber-700">
                  {authorizationError}
                </div>
              )}

              {canRenderPdfViewer ? (
                <Worker workerUrl={pdfWorkerUrl}>
                  <Viewer
                    fileUrl={pdfSourceUrl}
                    httpHeaders={authorizationHeader}
                    defaultScale={SpecialZoomLevel.PageFit}
                    plugins={[defaultLayoutPluginInstance]}
                    renderLoader={(percentages) => (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang
                        tải PDF {Math.round(percentages)}%
                      </div>
                    )}
                    renderError={() => (
                      <iframe
                        title={documentRecord.file_name || 'Document preview'}
                        src={previewUrl}
                        className="h-full min-h-[70vh] w-full border-0 bg-white"
                      />
                    )}
                  />
                </Worker>
              ) : (
                <iframe
                  title={documentRecord.file_name || 'Document preview'}
                  src={previewUrl}
                  className="h-full min-h-[70vh] w-full border-0 bg-white"
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
