import {
  createDocumentRecord,
  getDocumentByUid,
  getDocumentsByUidFile,
  updateDocumentRecord,
  type DocumentRecord,
} from '@/apis/document'
import { getFileRecordsByIds } from '@/apis/file'
import { Button } from '@/Components/ui/button'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { DocumentDetailHeader } from '@/features/document-detail/components/DocumentDetailHeader'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { DocumentRecordPanel } from '@/features/document-detail/components/DocumentRecordPanel'
import type { DocumentRecordFormValues } from '@/features/document-detail/types'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useUpdateFileRecord } from '@/hooks/useUpdateFileRecord'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

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

function normalizePdfFileName(fileName: string): string {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/\.pdf$/i, '')
}

export default function DocumentDetail() {
  const { documentId, fileId } = useParams<{
    documentId?: string
    fileId?: string
  }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [recordFormKey, setRecordFormKey] = useState(0)
  const [nextFormValues, setNextFormValues] =
    useState<DocumentRecordFormValues | null>(null)
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(
    null
  )
  const [previewPage, setPreviewPage] = useState<number | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState('')
  const [isSavingDocument, setIsSavingDocument] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const { showTypedToast } = useToast()
  const { updateFileRecord, isUpdatingFileRecord } = useUpdateFileRecord()
  const shouldShowUploadPdfButton =
    searchParams.get('uploadFile') === 'true' ||
    searchParams.get('upload_file') === 'true'
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
    setPreviewPage(null)
    setLocalPreviewUrl('')
  }, [documentId, fileId])

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  useEffect(() => {
    if (!fileUid || isLoadingDocuments || previewPage !== null) {
      return
    }

    setPreviewPage(documentRecords.length + 1)
  }, [documentRecords.length, fileUid, isLoadingDocuments, previewPage])

  useEffect(() => {
    if (error) {
      console.error('Không tải được document:', error)
    }
  }, [error])

  useEffect(() => {
    if (documentsError) {
      console.error('Không tải được danh sách documents:', documentsError)
    }
  }, [documentsError])

  useEffect(() => {
    if (fileError) {
      console.error('Không tải được file:', fileError)
    }
  }, [fileError])

  const previewUrl = getPreviewUrl(fileRecord)
  const effectivePreviewUrl = shouldShowUploadPdfButton ? '' : previewUrl
  const formInitialValues = useMemo<
    DocumentRecordFormValues | undefined
  >(() => {
    if (nextFormValues) {
      return nextFormValues
    }

    if (!fileRecord) {
      return undefined
    }

    return undefined
  }, [fileRecord, nextFormValues])

  const updateInitialValues = useMemo<
    DocumentRecordFormValues | undefined
  >(() => {
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
        soKyHieu: getNextSoKyHieu(values.soKyHieu),
        ngayThang: '',
        trichYeu: '',
        soTo: '',
      })
      if (isFileCompleted) {
        showTypedToast(
          EToastTypes.SUCCESS,
          `File ${fileRecord.file_name} đã nhập hoàn thành`
        )
      }
      setRecordFormKey((key) => key + 1)
    } catch (err) {
      console.error('Không lưu được document:', err)
      throw err
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
    } catch (err) {
      console.error('Không cập nhật được document:', err)
      throw err
    } finally {
      setIsSavingDocument(false)
    }
  }

  function handleLocalPdfChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''

    if (!selectedFile || !fileRecord) {
      return
    }

    if (
      normalizePdfFileName(selectedFile.name) !==
      normalizePdfFileName(fileRecord.file_name)
    ) {
      showTypedToast(
        EToastTypes.ERROR,
        `Tên file không khớp. Vui lòng chọn đúng file ${fileRecord.file_name}.pdf.`
      )
      return
    }

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      showTypedToast(EToastTypes.ERROR, 'Vui lòng chọn file PDF.')
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setLocalPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return objectUrl
    })
    showTypedToast(EToastTypes.SUCCESS, 'Đã tải PDF từ máy để xem trước.')
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <DocumentDetailHeader
        documentRecord={documentRecord}
        fileRecord={fileRecord}
        onBack={() => navigate('/')}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
        <div className="relative min-h-0">
          {shouldShowUploadPdfButton && !localPreviewUrl && (
            <>
              <input
                ref={uploadInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleLocalPdfChange}
              />
              <Button
                type="button"
                className="absolute right-4 top-4 z-10 bg-indigo-600 font-bold text-white shadow-lg hover:bg-indigo-700"
                onClick={() => uploadInputRef.current?.click()}
              >
                <UploadCloud className="mr-2 h-4 w-4" /> Upload PDF
              </Button>
            </>
          )}
          <DocumentPreviewPane
            fileRecord={fileRecord}
            previewUrl={effectivePreviewUrl}
            localPreviewUrl={localPreviewUrl}
            isLoading={isLoading || isLoadingFile || isLoadingDocuments}
            error={error || fileError || documentsError}
            page={previewPage ?? 0}
          />
        </div>
        {isLoadingDocuments ? (
          <aside className="flex min-h-0 items-center justify-center bg-slate-50 p-4 text-sm font-semibold text-slate-500 md:p-6">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải
            documents...
          </aside>
        ) : (
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
        )}
      </div>
    </main>
  )
}
