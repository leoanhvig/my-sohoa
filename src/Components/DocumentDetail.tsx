import { getDocumentByUid } from '@/apis/document'
import { DocumentDetailHeader } from '@/features/document-detail/components/DocumentDetailHeader'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { DocumentRecordPanel } from '@/features/document-detail/components/DocumentRecordPanel'
import { useCreateDocumentInfo } from '@/features/document-detail/hooks/useCreateDocumentInfo'
import { useDocumentDetails } from '@/features/document-detail/hooks/useDocumentDetails'
import { useMarkDocumentDone } from '@/features/document-detail/hooks/useMarkDocumentDone'
import type { DocumentRecordFormValues } from '@/features/document-detail/types'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function DocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const [recordFormKey, setRecordFormKey] = useState(0)
  const { createDocumentInfo, isCreatingDocumentInfo } = useCreateDocumentInfo()
  const { markDocumentDone, isMarkingDocumentDone } =
    useMarkDocumentDone(documentId)
  const {
    data: documentRecord,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => getDocumentByUid(documentId || ''),
    enabled: Boolean(documentId),
  })
  const { data: documentDetails = [] } = useDocumentDetails(documentId)

  const previewUrl = getPreviewUrl(documentRecord)

  async function handleApprove(values: DocumentRecordFormValues) {
    if (!documentRecord) return

    await createDocumentInfo({ documentRecord, values })
    setRecordFormKey((key) => key + 1)
  }

  async function handleApproveAndMarkDone(values: DocumentRecordFormValues) {
    if (!documentRecord) return

    await createDocumentInfo({ documentRecord, values })
    await markDocumentDone()
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <DocumentDetailHeader
        documentRecord={documentRecord}
        onBack={() => navigate('/')}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
        <DocumentPreviewPane
          documentRecord={documentRecord}
          previewUrl={previewUrl}
          isLoading={isLoading}
          error={error}
        />
        <DocumentRecordPanel
          formKey={recordFormKey}
          onApprove={handleApprove}
          onApproveAndMarkDone={handleApproveAndMarkDone}
          isSaving={isCreatingDocumentInfo}
          documentDetails={documentDetails}
          onMarkDocumentDone={markDocumentDone}
          isMarkingDocumentDone={isMarkingDocumentDone}
        />
      </div>
    </main>
  )
}
