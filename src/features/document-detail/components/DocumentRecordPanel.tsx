import type { DocumentRecordFormValues } from '../types'
import { DocumentRecordForm } from './DocumentRecordForm'

type DocumentRecordPanelProps = {
  formKey: number
  resetKey?: string
  initialValues?: DocumentRecordFormValues
  onApprove: (values: DocumentRecordFormValues) => void | Promise<void>
  isSaving: boolean
}

export function DocumentRecordPanel({
  formKey,
  resetKey,
  initialValues,
  onApprove,
  isSaving,
}: DocumentRecordPanelProps) {
  return (
    <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
      <div className="space-y-5">
        <DocumentRecordForm
          formKey={formKey}
          resetKey={resetKey}
          initialValues={initialValues}
          onApprove={onApprove}
          isSaving={isSaving}
        />
      </div>
    </aside>
  )
}
