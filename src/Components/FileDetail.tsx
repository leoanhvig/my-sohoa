import { getDocumentsByUidFile, type DocumentRecord } from '@/apis/document'
import { getFileRecordsByIds, type FileRecord } from '@/apis/file'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { useUpdateDocumentRecord } from '@/features/document-detail/hooks/useUpdateDocumentRecord'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText, Loader2, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type EditableDocumentValues = {
  so_ky_hieu: string
  ngay_thang: string
  tac_gia: string
  trich_yeu: string
  so_to: string
}

function toEditableValues(
  documentRecord: DocumentRecord
): EditableDocumentValues {
  return {
    so_ky_hieu: documentRecord.so_ky_hieu || '',
    ngay_thang: documentRecord.ngay_thang || '',
    tac_gia: documentRecord.tac_gia || '',
    trich_yeu: documentRecord.trich_yeu || '',
    so_to: documentRecord.so_to ? String(documentRecord.so_to) : '',
  }
}

function getDocumentStatus(documentRecord: DocumentRecord): string {
  if (documentRecord.is_completed) {
    return 'Đã hoàn thành'
  }

  if (documentRecord.enteredByUserId) {
    return 'Đang nhập'
  }

  return 'Chưa nhập'
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function EditableTextarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      />
    </div>
  )
}

export default function FileDetail() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const [selectedDocumentUid, setSelectedDocumentUid] = useState('')
  const [editableValuesByUid, setEditableValuesByUid] = useState<
    Record<string, EditableDocumentValues>
  >({})
  const { updateDocumentRecord, isUpdatingDocumentRecord } =
    useUpdateDocumentRecord()

  const {
    data: fileRecords = [],
    isLoading: isLoadingFile,
    error: fileError,
  } = useQuery({
    queryKey: ['files', 'detail', fileId],
    queryFn: () => getFileRecordsByIds(fileId ? [fileId] : []),
    enabled: Boolean(fileId),
  })
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useQuery<DocumentRecord[]>({
    queryKey: ['documents', 'by-file', fileId],
    queryFn: () => getDocumentsByUidFile(fileId || ''),
    enabled: Boolean(fileId),
  })
  const fileRecord = fileRecords[0] as FileRecord | undefined
  const documents: DocumentRecord[] = documentsData || []

  useEffect(() => {
    if (!selectedDocumentUid && documents.length > 0) {
      setSelectedDocumentUid(documents[0].uid)
    }
  }, [documents, selectedDocumentUid])

  useEffect(() => {
    setEditableValuesByUid((currentValues) => {
      const nextValues = { ...currentValues }

      for (const documentRecord of documents) {
        if (!nextValues[documentRecord.uid]) {
          nextValues[documentRecord.uid] = toEditableValues(documentRecord)
        }
      }

      return nextValues
    })
  }, [documents])

  const selectedDocument = useMemo(
    () =>
      documents.find(
        (documentRecord: DocumentRecord) =>
          documentRecord.uid === selectedDocumentUid
      ) ||
      documents[0] ||
      null,
    [documents, selectedDocumentUid]
  )
  const previewUrl = getPreviewUrl(selectedDocument)
  const isLoading = isLoadingFile || isLoadingDocuments
  const error = fileError || documentsError

  function updateEditableValue(
    documentUid: string,
    field: keyof EditableDocumentValues,
    value: string
  ) {
    setEditableValuesByUid((currentValues) => ({
      ...currentValues,
      [documentUid]: {
        ...(currentValues[documentUid] || {
          so_ky_hieu: '',
          ngay_thang: '',
          tac_gia: '',
          trich_yeu: '',
          so_to: '',
        }),
        [field]: value,
      },
    }))
  }

  async function handleSaveDocument(documentRecord: DocumentRecord) {
    const values = editableValuesByUid[documentRecord.uid]

    if (!values) {
      return
    }

    await updateDocumentRecord({
      uid: documentRecord.uid,
      so_ky_hieu: values.so_ky_hieu,
      ngay_thang: values.ngay_thang,
      tac_gia: values.tac_gia,
      trich_yeu: values.trich_yeu,
      so_to: Number(values.so_to || 0),
    })
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {fileRecord?.file_name || 'File detail'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              File ID:{' '}
              <span className="font-semibold">{fileId || 'Không có'}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Tổng PDF: {documents.length}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            Đã nhập: {fileRecord?.number_of_file_done || 0}
          </span>
        </div>
      </header>

      {error && (
        <div className="m-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error instanceof Error
            ? error.message
            : 'Không tải được dữ liệu file.'}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(520px,1fr)]">
        <DocumentPreviewPane
          documentRecord={selectedDocument}
          previewUrl={previewUrl}
          isLoading={isLoading}
          error={error}
        />

        <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải danh
              sách PDF...
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map(
                (documentRecord: DocumentRecord, index: number) => {
                  const values =
                    editableValuesByUid[documentRecord.uid] ||
                    toEditableValues(documentRecord)
                  const isSelected =
                    selectedDocument?.uid === documentRecord.uid

                  return (
                    <section
                      key={documentRecord.uid}
                      className={
                        isSelected
                          ? 'rounded-xl border-2 border-indigo-300 bg-white shadow-sm'
                          : 'rounded-xl border border-slate-200 bg-white shadow-sm'
                      }
                    >
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
                        onClick={() =>
                          setSelectedDocumentUid(documentRecord.uid)
                        }
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                          <div>
                            <p className="font-bold text-slate-900">
                              {index + 1}. {documentRecord.file_name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Document ID: {documentRecord.uid}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {getDocumentStatus(documentRecord)}
                        </span>
                      </button>

                      <div className="space-y-4 p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <EditableField
                            label="Số, ký hiệu"
                            value={values.so_ky_hieu}
                            onChange={(value) =>
                              updateEditableValue(
                                documentRecord.uid,
                                'so_ky_hieu',
                                value
                              )
                            }
                          />
                          <EditableField
                            label="Ngày, tháng, năm"
                            value={values.ngay_thang}
                            placeholder="dd/mm/yyyy"
                            onChange={(value) =>
                              updateEditableValue(
                                documentRecord.uid,
                                'ngay_thang',
                                value
                              )
                            }
                          />
                          <EditableField
                            label="Tác giả"
                            value={values.tac_gia}
                            onChange={(value) =>
                              updateEditableValue(
                                documentRecord.uid,
                                'tac_gia',
                                value
                              )
                            }
                          />
                          <EditableField
                            label="Tờ số/trang số"
                            value={values.so_to}
                            onChange={(value) =>
                              updateEditableValue(
                                documentRecord.uid,
                                'so_to',
                                value
                              )
                            }
                          />
                        </div>
                        <EditableTextarea
                          label="Trích yếu nội dung"
                          value={values.trich_yeu}
                          onChange={(value) =>
                            updateEditableValue(
                              documentRecord.uid,
                              'trich_yeu',
                              value
                            )
                          }
                        />
                        <Button
                          type="button"
                          className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700"
                          disabled={isUpdatingDocumentRecord}
                          onClick={() => handleSaveDocument(documentRecord)}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isUpdatingDocumentRecord
                            ? 'Đang lưu...'
                            : 'Lưu thông tin PDF này'}
                        </Button>
                      </div>
                    </section>
                  )
                }
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
              File này chưa có PDF nào.
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
