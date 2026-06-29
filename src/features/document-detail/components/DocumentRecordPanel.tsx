import type { DocumentInfoRecord } from '@/apis/document'
import { Button } from '@/Components/ui/button'
import type { DocumentRecordFormValues } from '../types'
import { DocumentDetailItemForm } from './DocumentDetailItemForm'
import { DocumentRecordForm } from './DocumentRecordForm'

type DocumentRecordPanelProps = {
  formKey: number
  onApprove: (values: DocumentRecordFormValues) => void | Promise<void>
  onApproveAndMarkDone: (
    values: DocumentRecordFormValues
  ) => void | Promise<void>
  isSaving: boolean
  documentDetails: DocumentInfoRecord[]
  onMarkDocumentDone: () => void | Promise<unknown>
  isMarkingDocumentDone: boolean
}

export function DocumentRecordPanel({
  formKey,
  onApprove,
  onApproveAndMarkDone,
  isSaving,
  documentDetails,
  onMarkDocumentDone,
  isMarkingDocumentDone,
}: DocumentRecordPanelProps) {
  const hasDocumentDetails = documentDetails.length > 0

  return (
    <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
      <div className="space-y-5">
        <DocumentRecordForm
          formKey={formKey}
          onApprove={onApprove}
          onApproveAndMarkDone={onApproveAndMarkDone}
          isSaving={isSaving}
        />
        {hasDocumentDetails && (
          <Button
            type="button"
            className="h-11 w-full bg-blue-600 font-bold shadow hover:bg-blue-700"
            disabled={isMarkingDocumentDone}
            onClick={onMarkDocumentDone}
          >
            {isMarkingDocumentDone ? 'Đang chuyển trang...' : 'Chuyển trang'}
          </Button>
        )}
        {documentDetails.map((documentDetail) => (
          <DocumentDetailItemForm
            key={documentDetail.uid}
            documentDetail={documentDetail}
          />
        ))}
      </div>
    </aside>
  )
}
