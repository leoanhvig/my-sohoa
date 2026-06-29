import type { DocumentRecord } from '@/apis/document'
import { useEffect, useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<DocumentRecordPanelTab>('form')
  const isUpdateMode = Boolean(editingDocument)

  useEffect(() => {
    if (editingDocument) {
      setActiveTab('form')
    }
  }, [editingDocument])

  return (
    <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
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
        )}

        {activeTab === 'documents' && (
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-bold text-slate-900">
                File đã nhập ({documents.length})
              </h2>
            </div>
            {documents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {documents.map((documentRecord, index) => (
                  <button
                    key={documentRecord.uid}
                    type="button"
                    className="block w-full space-y-1 px-4 py-3 text-left transition hover:bg-slate-50"
                    onClick={() => {
                      onStartUpdate(documentRecord)
                      setActiveTab('form')
                    }}
                  >
                    <p className="text-sm font-bold text-slate-900">
                      {index + 1}.{' '}
                      {`${documentRecord.so_ky_hieu}-${documentRecord.so_to}` ||
                        'Chưa có số ký hiệu'}
                    </p>
                  </button>
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
