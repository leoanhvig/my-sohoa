import {
  createDocumentRecord,
  deleteDocumentRecord,
  getDocumentsByUidFile,
  updateDocumentRecord,
  type DocumentRecord,
} from '@/apis/document'
import { getHoTichFileRecordsByIds } from '@/apis/file'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { DocumentRecordPanel } from '@/features/document-detail/components/DocumentRecordPanel'
import type { DocumentRecordFormValues } from '@/features/document-detail/types'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useUpdateFileRecord } from '@/hooks/useUpdateFileRecord'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

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

function getNextSoTo(soTo: string): string {
  const currentNumber = Number(soTo)

  if (!Number.isFinite(currentNumber)) {
    return soTo
  }

  const nextNumber = currentNumber + 1

  return nextNumber < 10
    ? String(nextNumber).padStart(2, '0')
    : String(nextNumber)
}

export default function HoTichDocumentDetail() {
  const { fileId } = useParams<{ fileId: string }>()
  const queryClient = useQueryClient()
  const { showTypedToast } = useToast()
  const [recordFormKey, setRecordFormKey] = useState(0)
  const [nextFormValues, setNextFormValues] =
    useState<DocumentRecordFormValues | null>(null)
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(
    null
  )
  const [previewPage, setPreviewPage] = useState<number | null>(null)
  const [isSavingDocument, setIsSavingDocument] = useState(false)
  const [deletingDocumentUid, setDeletingDocumentUid] = useState<string | null>(
    null
  )
  const { updateFileRecord, isUpdatingFileRecord } = useUpdateFileRecord('ho-tich')
  const fileUid = fileId || ''
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
    queryKey: ['ho-tich-files', 'detail', fileUid],
    queryFn: () => getHoTichFileRecordsByIds(fileUid ? [fileUid] : []),
    enabled: Boolean(fileUid),
  })
  const fileRecord = fileRecords[0] || null

  useEffect(() => {
    setNextFormValues(null)
    setEditingDocument(null)
    setPreviewPage(null)
  }, [fileId])

  useEffect(() => {
    if (!fileUid || isLoadingDocuments || previewPage !== null) {
      return
    }

    setPreviewPage(documentRecords.length + 1)
  }, [documentRecords.length, fileUid, isLoadingDocuments, previewPage])

  const formInitialValues = useMemo<DocumentRecordFormValues | undefined>(() => {
    return nextFormValues || undefined
  }, [nextFormValues])

  const updateInitialValues = useMemo<DocumentRecordFormValues | undefined>(() => {
    if (!editingDocument) {
      return undefined
    }

    return {
      soKyHieu: editingDocument.so_ky_hieu || '',
      isSoKyHieuTangDan: false,
      isSoToTangDan: false,
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
        so_to: values.soTo ?? '',
        trich_yeu: values.trichYeu,
      })
      await updateFileRecord({
        uid: fileRecord.uid,
        number_of_file_done: nextDonePages,
        is_completed: isFileCompleted,
      })
      await queryClient.invalidateQueries({
        queryKey: ['documents', 'by-file', fileRecord.uid],
      })
      setNextFormValues({
        ...values,
        soKyHieu: values.isSoKyHieuTangDan
          ? getNextSoKyHieu(values.soKyHieu)
          : '',
        trichYeu: '',
        soTo: values.isSoToTangDan ? getNextSoTo(values.soTo) : '',
      })
      if (isFileCompleted) {
        showTypedToast(
          EToastTypes.SUCCESS,
          `Hồ tịch ${fileRecord.file_name} đã nhập hoàn thành`
        )
      }
      setRecordFormKey((key) => key + 1)
    } catch (error) {
      console.error('Không lưu được document Hộ tịch:', error)
      throw error
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
        so_to: values.soTo,
        trich_yeu: values.trichYeu,
      })
      await queryClient.invalidateQueries({
        queryKey: ['documents', 'by-file', editingDocument.uid_file],
      })
      setEditingDocument(null)
      setRecordFormKey((key) => key + 1)
    } catch (error) {
      console.error('Không cập nhật được document Hộ tịch:', error)
      throw error
    } finally {
      setIsSavingDocument(false)
    }
  }

  async function handleDelete(documentToDelete: DocumentRecord) {
    if (!fileRecord?.is_completed) {
      showTypedToast(
        EToastTypes.ERROR,
        'Chỉ được xóa record khi hồ tịch đã hoàn thành.'
      )
      return
    }

    if (!window.confirm('Bạn có chắc muốn xóa record Hộ tịch này không?')) {
      return
    }

    try {
      setDeletingDocumentUid(documentToDelete.uid)
      await deleteDocumentRecord(documentToDelete.uid)
      const nextTotalPages = Math.max((fileRecord.number_of_file || 0) - 1, 0)
      const nextDonePages = Math.max(
        (fileRecord.number_of_file_done || 0) - 1,
        0
      )
      await updateFileRecord({
        uid: fileRecord.uid,
        number_of_file: nextTotalPages,
        number_of_file_done: nextDonePages,
        is_completed: nextTotalPages > 0 && nextDonePages >= nextTotalPages,
      })
      await queryClient.invalidateQueries({
        queryKey: ['documents', 'by-file', documentToDelete.uid_file],
      })
      if (editingDocument?.uid === documentToDelete.uid) {
        setEditingDocument(null)
      }
      showTypedToast(EToastTypes.SUCCESS, 'Đã xóa record Hộ tịch')
    } catch (error) {
      console.error('Không xóa được record Hộ tịch:', error)
      showTypedToast(
        EToastTypes.ERROR,
        'Không xóa được record Hộ tịch. Vui lòng thử lại.'
      )
    } finally {
      setDeletingDocumentUid(null)
    }
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
        <DocumentPreviewPane
          fileRecord={fileRecord}
          previewUrl={getPreviewUrl(fileRecord)}
          isLoading={isLoadingFile || isLoadingDocuments}
          error={fileError || documentsError}
          page={previewPage ?? 0}
        />
        {isLoadingDocuments ? (
          <aside className="flex min-h-0 items-center justify-center bg-slate-50 p-4 text-sm font-semibold text-slate-500 md:p-6">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải
            documents Hộ tịch...
          </aside>
        ) : (
          <DocumentRecordPanel
            formKey={recordFormKey}
            resetKey={fileRecord?.uid}
            initialValues={formInitialValues}
            editingDocument={editingDocument}
            updateInitialValues={updateInitialValues}
            fileRecord={fileRecord}
            documents={documentRecords}
            onApprove={handleApprove}
            onUpdate={handleUpdate}
            onStartUpdate={setEditingDocument}
            onDelete={handleDelete}
            onCancelUpdate={() => setEditingDocument(null)}
            isSaving={isUpdatingFileRecord || isSavingDocument}
            canDeleteDocuments={Boolean(fileRecord?.is_completed)}
            deletingDocumentUid={deletingDocumentUid}
          />
        )}
      </div>
    </main>
  )
}
