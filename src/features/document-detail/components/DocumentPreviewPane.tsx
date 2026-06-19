import type { DocumentRecord } from '@/apis/document'
import { Loader2 } from 'lucide-react'
import { StatusMessage } from './StatusMessage'

type DocumentPreviewPaneProps = {
  documentRecord?: DocumentRecord | null
  previewUrl: string
  isLoading: boolean
  error: unknown
}

export function DocumentPreviewPane({
  documentRecord,
  previewUrl,
  isLoading,
  error,
}: DocumentPreviewPaneProps) {
  return (
    <section className="min-h-[45vh] border-r border-slate-300 bg-slate-500 md:min-h-0">
      {isLoading && (
        <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải file...
        </div>
      )}

      {error && (
        <StatusMessage tone="error" message="Không tải được thông tin hồ sơ." />
      )}

      {!isLoading && !error && !documentRecord && (
        <StatusMessage tone="warning" message="Không tìm thấy hồ sơ." />
      )}

      {documentRecord && previewUrl && (
        <iframe
          title={documentRecord.file_name || 'Document preview'}
          src={previewUrl}
          className="h-full w-full border-0"
        />
      )}

      {documentRecord && !previewUrl && (
        <StatusMessage
          tone="warning"
          message="Hồ sơ chưa có đường dẫn xem trước."
        />
      )}
    </section>
  )
}
