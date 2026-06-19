import type { DocumentInfoRecord } from '@/apis/document'
import { useUpdateDocumentInfo } from '@/features/document-detail/hooks/useUpdateDocumentInfo'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DocumentRecordFormValues } from '../types'
import { DocumentDetailForm } from './DocumentDetailForm'

type DocumentDetailItemFormProps = {
  documentDetail: DocumentInfoRecord
}

export function DocumentDetailItemForm({
  documentDetail,
}: DocumentDetailItemFormProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [formValues, setFormValues] = useState<DocumentRecordFormValues>({
    tacGia: documentDetail.tacGia || '',
    soTo: documentDetail.soTo || '',
    soKyHieu: documentDetail.soKyHieu || '',
    ngayThang: documentDetail.ngayThang || '',
    trichYeu: documentDetail.trichYeu || '',
  })
  const { updateDocumentInfo, isUpdatingDocumentInfo } = useUpdateDocumentInfo()

  useEffect(() => {
    setFormValues({
      tacGia: documentDetail.tacGia || '',
      soTo: documentDetail.soTo || '',
      soKyHieu: documentDetail.soKyHieu || '',
      ngayThang: documentDetail.ngayThang || '',
      trichYeu: documentDetail.trichYeu || '',
    })
  }, [documentDetail])

  async function handleUpdateDocumentDetail() {
    await updateDocumentInfo({
      uid: documentDetail.uid,
      documentUid: documentDetail.documentUid,
      ...formValues,
    })
    setIsCollapsed(true)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-t-lg bg-slate-100 px-4 py-3 text-left transition hover:bg-slate-200"
        onClick={() => setIsCollapsed((value) => !value)}
      >
        <div>
          <p className="text-sm font-bold text-slate-900">
            Document detail UID: {documentDetail.uid}
          </p>
          <p className="text-xs text-slate-500">
            Tờ số/trang số: {documentDetail.soTo || 'Chưa nhập'}
          </p>
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-5 w-5 text-slate-600" />
        ) : (
          <ChevronUp className="h-5 w-5 text-slate-600" />
        )}
      </button>

      {!isCollapsed && (
        <div className="space-y-4 p-4">
          <DocumentDetailForm
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleUpdateDocumentDetail}
            isSubmitting={isUpdatingDocumentInfo}
            submitLabel="Update document detail"
            submittingLabel="Updating..."
          />
        </div>
      )}
    </section>
  )
}
