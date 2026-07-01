import type { DocumentRecord } from '@/apis/document'
import { Loader2, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import type { DocumentRecordFormValues } from '../types'
import { DocumentRecordForm } from './DocumentRecordForm'

type DocumentRecordPanelTab = 'form' | 'documents'

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
  onDelete: (documentRecord: DocumentRecord) => void | Promise<void>
  onCancelUpdate: () => void
  isSaving: boolean
  deletingDocumentUid?: string | null
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
  onDelete,
  onCancelUpdate,
  isSaving,
  deletingDocumentUid,
}: DocumentRecordPanelProps) {
  const [activeTab, setActiveTab] = useState<DocumentRecordPanelTab>('form')
  const isUpdateMode = Boolean(editingDocument)

  useEffect(() => {
    if (editingDocument) {
      setActiveTab('form')
    }
  }, [editingDocument])

  return (
    <aside className="min-h-0 overflow-hidden bg-slate-50 p-4">
      <div className="flex h-full min-h-0 flex-col gap-5">
        <div className="grid shrink-0 grid-cols-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm ">
          <button
            type="button"
            className={
              activeTab === 'form'
                ? 'rounded-md bg-indigo-600 px-3 py-2 text-sm font-bold text-white shadow-sm'
                : 'rounded-md px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50'
            }
            onClick={() => setActiveTab('form')}
          >
            Form nhập
          </button>
          <button
            type="button"
            className={
              activeTab === 'documents'
                ? 'rounded-md bg-indigo-600 px-3 py-2 text-sm font-bold text-white shadow-sm'
                : 'rounded-md px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50'
            }
            onClick={() => setActiveTab('documents')}
          >
            File đã nhập ({documents.length})
          </button>
        </div>

        {activeTab === 'form' && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DocumentRecordForm
              formKey={isUpdateMode ? editingDocument?.uid : formKey}
              resetKey={isUpdateMode ? editingDocument?.uid : resetKey}
              initialValues={isUpdateMode ? updateInitialValues : initialValues}
              onApprove={isUpdateMode ? onUpdate : onApprove}
              isSaving={isSaving}
              submitLabel={isUpdateMode ? 'Lưu cập nhật' : undefined}
              submittingLabel={isUpdateMode ? 'Đang cập nhật...' : undefined}
              onCancel={isUpdateMode ? onCancelUpdate : undefined}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <section className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            {documents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {[...documents].reverse().map((documentRecord, index) => (
                  <Fragment key={documentRecord.uid}>
                    <div className="flex items-start gap-2 px-4 py-3 transition hover:bg-slate-50">
                      <button
                        type="button"
                        className="block min-w-0 flex-1 space-y-1 text-left"
                        onClick={() => {
                          onStartUpdate(documentRecord)
                          setActiveTab('form')
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-slate-900">
                            {documents.length - index}.{' '}
                            {`${documentRecord.so_ky_hieu}-${documentRecord.so_to}` ||
                              'Chưa có số ký hiệu'}
                          </p>
                          <p className="text-xs font-semibold text-slate-600">
                            Ngày tháng: {documentRecord.ngay_thang || 'Chưa có'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Trích yếu: {documentRecord.trich_yeu || 'Chưa có'}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Xóa record"
                        aria-label="Xóa record document"
                        disabled={Boolean(deletingDocumentUid) || isSaving}
                        onClick={() => onDelete(documentRecord)}
                      >
                        {deletingDocumentUid === documentRecord.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                Chưa có file nào được nhập.
              </div>
            )}
          </section>
        )}
      </div>
    </aside>
  )
}
