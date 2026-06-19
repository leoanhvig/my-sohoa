import { getDocumentByUid } from '@/apis/document'
import { DocumentDetailHeader } from '@/features/document-detail/components/DocumentDetailHeader'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { DocumentRecordPanel } from '@/features/document-detail/components/DocumentRecordPanel'
import { defaultRecordFormValues } from '@/features/document-detail/constants'
import type { DocumentRecordFormValues } from '@/features/document-detail/types'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

export default function DocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false)
  const [recordFormKey, setRecordFormKey] = useState(0)
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<DocumentRecordFormValues>({
    defaultValues: defaultRecordFormValues,
  })
  const {
    data: documentRecord,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => getDocumentByUid(documentId || ''),
    enabled: Boolean(documentId),
  })

  const previewUrl = getPreviewUrl(documentRecord)

  function handleApprove(values: DocumentRecordFormValues) {
    console.log('Document record form values:', values)
    window.alert('Chức năng lưu & duyệt sẽ được kết nối sau.')
    reset(defaultRecordFormValues)
    setIsRecordFormOpen(false)
  }

  function handleOpenRecordForm() {
    setRecordFormKey((key) => key + 1)
    setIsRecordFormOpen(true)
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
          isOpen={isRecordFormOpen}
          formKey={recordFormKey}
          errors={errors}
          register={register}
          handleSubmit={handleSubmit}
          onApprove={handleApprove}
          onOpenForm={handleOpenRecordForm}
          reset={reset}
        />
      </div>
    </main>
  )
}
