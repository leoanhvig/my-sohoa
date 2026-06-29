import { getDocumentByUid } from '@/apis/document'
import { getFileRecordsByIds } from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { DocumentDetailHeader } from '@/features/document-detail/components/DocumentDetailHeader'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { DocumentRecordPanel } from '@/features/document-detail/components/DocumentRecordPanel'
import type { DocumentRecordFormValues } from '@/features/document-detail/types'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useUpdateFileRecord } from '@/hooks/useUpdateFileRecord'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function getNextSoKyHieu(soKyHieu: string): string {
  const match = soKyHieu.match(/\d+/)

  if (!match) {
    return soKyHieu
  }

  const currentNumber = match[0]
  const nextNumber = String(Number(currentNumber) + 1).padStart(
    currentNumber.length,
    '0'
  )

  return `${soKyHieu.slice(0, match.index)}${nextNumber}${soKyHieu.slice(
    (match.index || 0) + currentNumber.length
  )}`
}

export default function DocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const [recordFormKey, setRecordFormKey] = useState(0)
  const [nextFormValues, setNextFormValues] =
    useState<DocumentRecordFormValues | null>(null)
  const { showTypedToast } = useToast()
  const { updateFileRecord, isUpdatingFileRecord } = useUpdateFileRecord()
  const {
    data: documentRecord,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => getDocumentByUid(documentId || ''),
    enabled: Boolean(documentId),
  })
  const {
    data: fileRecords = [],
    isLoading: isLoadingFile,
    error: fileError,
  } = useQuery({
    queryKey: ['files', 'detail', documentRecord?.uid_file],
    queryFn: () =>
      getFileRecordsByIds(
        documentRecord?.uid_file ? [documentRecord.uid_file] : []
      ),
    enabled: Boolean(documentRecord?.uid_file),
  })
  const fileRecord = fileRecords[0] || null

  useEffect(() => {
    setNextFormValues(null)
  }, [documentId])

  const previewUrl = getPreviewUrl(fileRecord)
  const formInitialValues = useMemo<
    DocumentRecordFormValues | undefined
  >(() => {
    if (nextFormValues) {
      return nextFormValues
    }

    if (!fileRecord) {
      return undefined
    }

    return {
      soKyHieu: fileRecord.so_ky_hieu || '',
      ngayThang: fileRecord.ngay_thang || '',
      coQuanBanHanh: fileRecord.co_quan_ban_hanh || fileRecord.tac_gia || '',
      trichYeu: fileRecord.trich_yeu || '',
      soTo: fileRecord.so_to ? String(fileRecord.so_to) : '',
    }
  }, [fileRecord, nextFormValues])

  async function handleApprove(values: DocumentRecordFormValues) {
    if (!fileRecord) return
    const totalPages = fileRecord.number_of_file || 0
    const nextDonePages = Math.min(
      (fileRecord.number_of_file_done || 0) + 1,
      totalPages || (fileRecord.number_of_file_done || 0) + 1
    )
    const isFileCompleted = totalPages > 0 && nextDonePages >= totalPages

    await updateFileRecord({
      uid: fileRecord.uid,
      file_name: fileRecord.file_name,
      number_of_file: totalPages,
      number_of_file_done: nextDonePages,
      is_completed: isFileCompleted,
      creator_uid: fileRecord.creator_uid,
      updated_uid: fileRecord.updated_uid,
      storage_provider: fileRecord.storage_provider || 'firebase_storage',
      relative_path: fileRecord.relative_path,
      storage_path: fileRecord.storage_path,
      download_url: fileRecord.download_url,
      so_ky_hieu: values.soKyHieu,
      ngay_thang: values.ngayThang,
      tac_gia: values.coQuanBanHanh,
      co_quan_ban_hanh: values.coQuanBanHanh,
      trich_yeu: values.trichYeu,
      so_to: Number(values.soTo || 1),
    })
    setNextFormValues({
      ...values,
      soKyHieu: getNextSoKyHieu(values.soKyHieu),
      ngayThang: '',
      trichYeu: '',
    })
    if (isFileCompleted) {
      showTypedToast(
        EToastTypes.SUCCESS,
        `File ${fileRecord.file_name} đã nhập hoàn thành`
      )
    }
    setRecordFormKey((key) => key + 1)
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <DocumentDetailHeader
        documentRecord={documentRecord}
        fileRecord={fileRecord}
        onBack={() => navigate('/')}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
        <DocumentPreviewPane
          fileRecord={fileRecord}
          previewUrl={previewUrl}
          isLoading={isLoading || isLoadingFile}
          error={error || fileError}
        />
        <DocumentRecordPanel
          formKey={recordFormKey}
          resetKey={fileRecord?.uid}
          initialValues={formInitialValues}
          onApprove={handleApprove}
          isSaving={isUpdatingFileRecord}
        />
      </div>
    </main>
  )
}
