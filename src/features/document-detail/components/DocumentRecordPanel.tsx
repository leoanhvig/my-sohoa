import type { DocumentRecord } from '@/apis/document'
import type { DocumentRecordFormValues } from '../types'
import { DocumentRecordForm } from './DocumentRecordForm'

type DocumentRecordPanelProps = {
  formKey: number
  resetKey?: string
  initialValues?: DocumentRecordFormValues
  editingDocument?: DocumentRecord | null
  updateInitialValues?: DocumentRecordFormValues
  documents: DocumentRecord[]
  onApprove: (values: DocumentRecordFormValues) => void | Promise<void>
  onUpdate: (values: DocumentRecordFormValues) => void | Promise<void>
  onStartUpdate: (documentRecord: DocumentRecord) => void
  onCancelUpdate: () => void
  isSaving: boolean
}

export function DocumentRecordPanel({
  formKey,
  resetKey,
  initialValues,
  editingDocument,
  updateInitialValues,
  documents,
  onApprove,
  onUpdate,
  onStartUpdate,
  onCancelUpdate,
  isSaving,
}: DocumentRecordPanelProps) {
  const isUpdateMode = Boolean(editingDocument)

  return (
    <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
      <div className="space-y-5">
        <DocumentRecordForm
          formKey={formKey}
          resetKey={isUpdateMode ? editingDocument?.uid : resetKey}
          initialValues={isUpdateMode ? updateInitialValues : initialValues}
          onApprove={isUpdateMode ? onUpdate : onApprove}
          isSaving={isSaving}
          submitLabel={isUpdateMode ? 'Lưu cập nhật' : undefined}
          submittingLabel={isUpdateMode ? 'Đang cập nhật...' : undefined}
          onCancel={isUpdateMode ? onCancelUpdate : undefined}
        />
        {!isUpdateMode && documents.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-900">
                Document đã nhập ({documents.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {documents.map((documentRecord, index) => (
                <button
                  key={documentRecord.uid}
                  type="button"
                  className="block w-full space-y-1 px-4 py-3 text-left transition hover:bg-slate-50"
                  onClick={() => onStartUpdate(documentRecord)}
                >
                  <p className="text-sm font-bold text-slate-900">
                    {index + 1}.{' '}
                    {documentRecord.so_ky_hieu || 'Chưa có số ký hiệu'}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {documentRecord.co_quan_ban_hanh ||
                      'Chưa có cơ quan ban hành'}
                    {documentRecord.ngay_thang
                      ? ` • ${documentRecord.ngay_thang}`
                      : ''}
                  </p>
                  {documentRecord.trich_yeu && (
                    <p className="line-clamp-2 text-xs text-slate-600">
                      {documentRecord.trich_yeu}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
