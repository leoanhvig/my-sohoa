import {
  createDocumentRecord,
  getDocumentByUid,
  getDocumentsByUidFile,
  updateDocumentRecord,
  type DocumentRecord,
} from '@/apis/document'
import { getFileRecordsByIds } from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { DocumentDetailHeader } from '@/features/document-detail/components/DocumentDetailHeader'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { DocumentRecordPanel } from '@/features/document-detail/components/DocumentRecordPanel'
import type { DocumentRecordFormValues } from '@/features/document-detail/types'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useUpdateFileRecord } from '@/hooks/useUpdateFileRecord'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const { documentId, fileId } = useParams<{
    documentId?: string
    fileId?: string
  }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [recordFormKey, setRecordFormKey] = useState(0)
  const [nextFormValues, setNextFormValues] =
    useState<DocumentRecordFormValues | null>(null)
  const [editingDocument, setEditingDocument] =
    useState<DocumentRecord | null>(null)
  const [isSavingDocument, setIsSavingDocument] = useState(false)
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
  const fileUid = fileId || documentRecord?.uid_file || ''
  const {
    data: documentRecords = [],
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useQuery({
    queryKey: ['documents', 'by-file', fileUid],
    queryFn: () => getDocumentsByUidFile(fileUid),
    enabled: Boolean(fileUid),
  })
  const {
    data: fileRecords = [],
    isLoading: isLoadingFile,
    error: fileError,
  } = useQuery({
    queryKey: ['files', 'detail', fileUid],
    queryFn: () => getFileRecordsByIds(fileUid ? [fileUid] : []),
    enabled: Boolean(fileUid),
  })
  const fileRecord = fileRecords[0] || null

  useEffect(() => {
    setNextFormValues(null)
    setEditingDocument(null)
  }, [documentId, fileId])

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

    const latestDocumentRecord = documentRecords[documentRecords.length - 1]

    return {
      soKyHieu: latestDocumentRecord?.so_ky_hieu || '',
      ngayThang: latestDocumentRecord?.ngay_thang || '',
      coQuanBanHanh: latestDocumentRecord?.co_quan_ban_hanh || '',
      trichYeu: latestDocumentRecord?.trich_yeu || '',
      soTo: latestDocumentRecord?.so_to
        ? String(latestDocumentRecord.so_to)
        : '',
    }
  }, [documentRecords, fileRecord, nextFormValues])

  const updateInitialValues = useMemo<DocumentRecordFormValues | undefined>(() => {
    if (!editingDocument) {
      return undefined
    }

    return {
      soKyHieu: editingDocument.so_ky_hieu || '',
      ngayThang: editingDocument.ngay_thang || '',
      coQuanBanHanh: editingDocument.co_quan_ban_hanh || '',
      trichYeu: editingDocument.trich_yeu || '',
      soTo: editingDocument.so_to ? String(editingDocument.so_to) : '',
    }
  }, [editingDocument])

  async function handleApprove(values: DocumentRecordFormValues) {
    if (!fileRecord) return
    const totalPages = fileRecord.number_of_file || 0
    const nextDonePages = Math.min(
      (fileRecord.number_of_file_done || 0) + 1,
      totalPages || (fileRecord.number_of_file_done || 0) + 1
    )
    const isFileCompleted = totalPages > 0 && nextDonePages >= totalPages

    try {
      setIsSavingDocument(true)
      await createDocumentRecord({
        uid_file: fileRecord.uid,
        enteredByUserId: fileRecord.enteredByUserId,
        co_quan_ban_hanh: values.coQuanBanHanh,
        ngay_thang: values.ngayThang,
        so_ky_hieu: values.soKyHieu,
        so_to: Number(values.soTo || 1),
        trich_yeu: values.trichYeu,
      })

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
      })
      await queryClient.invalidateQueries({
        queryKey: ['documents', 'by-file', fileRecord.uid],
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
    } finally {
      setIsSavingDocument(false)
    }
  }

  async function handleUpdate(values: DocumentRecordFormValues) {
    if (!editingDocument) return

    try {
      setIsSavingDocument(true)
      await updateDocumentRecord({
        uid: editingDocument.uid,
        co_quan_ban_hanh: values.coQuanBanHanh,
        ngay_thang: values.ngayThang,
        so_ky_hieu: values.soKyHieu,
        so_to: Number(values.soTo || 1),
        trich_yeu: values.trichYeu,
      })
      await queryClient.invalidateQueries({
        queryKey: ['documents', 'by-file', editingDocument.uid_file],
      })
      setEditingDocument(null)
      setRecordFormKey((key) => key + 1)
    } finally {
      setIsSavingDocument(false)
    }
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
          isLoading={isLoading || isLoadingFile || isLoadingDocuments}
          error={error || fileError || documentsError}
        />
        <DocumentRecordPanel
          formKey={recordFormKey}
          resetKey={fileRecord?.uid}
          initialValues={formInitialValues}
          editingDocument={editingDocument}
          updateInitialValues={updateInitialValues}
          documents={documentRecords}
          onApprove={handleApprove}
          onUpdate={handleUpdate}
          onStartUpdate={setEditingDocument}
          onCancelUpdate={() => setEditingDocument(null)}
          isSaving={isUpdatingFileRecord || isSavingDocument}
        />
      </div>
    </main>
  )
}
