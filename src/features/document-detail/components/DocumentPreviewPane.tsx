import type { DocumentRecord } from '@/apis/document'
import { getLocalFileContentUrl } from '@/apis/storage'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { StatusMessage } from './StatusMessage'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

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
  const [numberOfPages, setNumberOfPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.15)
  const [pdfError, setPdfError] = useState('')
  const previewKind = getPreviewKind(documentRecord)
  const pdfSourceUrl = documentRecord
    ? getPdfSourceUrl(documentRecord, previewUrl)
    : ''
  const canRenderPdfViewer = previewKind === 'pdf' && Boolean(pdfSourceUrl)

  useEffect(() => {
    setNumberOfPages(0)
    setPageNumber(1)
    setPdfError('')
  }, [pdfSourceUrl])

  function goToPreviousPage() {
    setPageNumber((currentPage) => Math.max(1, currentPage - 1))
  }

  function goToNextPage() {
    setPageNumber((currentPage) =>
      numberOfPages ? Math.min(numberOfPages, currentPage + 1) : currentPage
    )
  }

  function zoomOut() {
    setScale((currentScale) =>
      Math.max(0.6, Number((currentScale - 0.15).toFixed(2)))
    )
  }

  function zoomIn() {
    setScale((currentScale) =>
      Math.min(2.4, Number((currentScale + 0.15).toFixed(2)))
    )
  }

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
                <div className="flex h-full min-h-[70vh] flex-col bg-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-500 bg-slate-800 px-3 py-2 text-xs font-bold text-white">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={pageNumber <= 1}
                        onClick={goToPreviousPage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span>
                        Trang {pageNumber}/{numberOfPages || '...'}
                      </span>
                      <button
                        type="button"
                        className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!numberOfPages || pageNumber >= numberOfPages}
                        onClick={goToNextPage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
                        onClick={zoomOut}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <span>{Math.round(scale * 100)}%</span>
                      <button
                        type="button"
                        className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
                        onClick={zoomIn}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto p-4">
                    {pdfError && (
                      <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                        Không hiển thị được PDF: {pdfError}
                      </div>
                    )}

                    <Document
                      file={pdfSourceUrl}
                      onLoadSuccess={({ numPages }) => {
                        setPdfError('')
                        setNumberOfPages(numPages)
                        setPageNumber(1)
                      }}
                      onLoadError={(loadError) => {
                        setPdfError(loadError.message)
                      }}
                      loading={
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang
                          tải PDF...
                        </div>
                      }
                      error={
                        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                          Không tải được PDF. Hãy kiểm tra file có tồn tại trong
                          thư mục uploads hay không.
                        </div>
                      }
                    >
                      <div className="flex justify-center">
                        <Page
                          pageNumber={pageNumber}
                          scale={scale}
                          renderAnnotationLayer
                          renderTextLayer
                        />
                      </div>
                    </Document>
                  </div>
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
