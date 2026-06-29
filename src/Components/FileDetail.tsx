import { getDocumentsByUidFile, type DocumentRecord } from '@/apis/document'
import { getFileRecordsByIds, type FileRecord } from '@/apis/file'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { DocumentPreviewPane } from '@/features/document-detail/components/DocumentPreviewPane'
import { getPreviewUrl } from '@/features/document-detail/utils'
import { useUpdateFileRecord } from '@/hooks/useUpdateFileRecord'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText, Loader2, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type EditableFileValues = {
  file_name: string
  number_of_file: string
  number_of_file_done: string
  creator_uid: string
  updated_uid: string
  storage_provider: 'firebase_storage'
}

function toEditableFileValues(fileRecord: FileRecord): EditableFileValues {
  return {
    file_name: fileRecord.file_name || '',
    number_of_file: String(fileRecord.number_of_file || 0),
    number_of_file_done: String(fileRecord.number_of_file_done || 0),
    creator_uid: fileRecord.creator_uid || '',
    updated_uid: fileRecord.updated_uid || '',
    storage_provider: fileRecord.storage_provider || 'firebase_storage',
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

export default function FileDetail() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const [selectedDocumentUid, setSelectedDocumentUid] = useState('')
  const [editableFileValues, setEditableFileValues] =
    useState<EditableFileValues | null>(null)
  const { updateFileRecord, isUpdatingFileRecord } = useUpdateFileRecord()

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
    if (fileRecord) {
      setEditableFileValues(toEditableFileValues(fileRecord))
    }
  }, [fileRecord])

  useEffect(() => {
    if (!selectedDocumentUid && documents.length > 0) {
      setSelectedDocumentUid(documents[0].uid)
    }
  }, [documents, selectedDocumentUid])

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
  const previewUrl = getPreviewUrl(fileRecord)
  const isLoading = isLoadingFile || isLoadingDocuments
  const error = fileError || documentsError

  function updateEditableFileValue(
    field: keyof EditableFileValues,
    value: string
  ) {
    setEditableFileValues((currentValues) => {
      const fallbackValues = fileRecord
        ? toEditableFileValues(fileRecord)
        : {
            file_name: '',
            number_of_file: '0',
            number_of_file_done: '0',
            creator_uid: '',
            updated_uid: '',
            storage_provider: 'firebase_storage' as const,
          }

      return {
        ...(currentValues || fallbackValues),
        [field]: value,
      }
    })
  }

  async function handleSaveFile() {
    if (!fileRecord || !editableFileValues) {
      return
    }

    await updateFileRecord({
      uid: fileRecord.uid,
      file_name: editableFileValues.file_name,
      number_of_file: Number(editableFileValues.number_of_file || 0),
      number_of_file_done: Number(editableFileValues.number_of_file_done || 0),
      creator_uid: editableFileValues.creator_uid,
      updated_uid: editableFileValues.updated_uid,
      storage_provider: editableFileValues.storage_provider,
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
          fileRecord={fileRecord}
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
          ) : (
            <div className="space-y-4">
              {fileRecord && editableFileValues && (
                <section className="rounded-xl border border-indigo-200 bg-white shadow-sm">
                  <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-3">
                    <h2 className="font-bold text-indigo-900">
                      Thông tin File
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-indigo-700">
                      Các field này lưu trong collection File. Sửa xong bấm lưu
                      để update Firebase.
                    </p>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <EditableField
                        label="Tên file / bộ hồ sơ"
                        value={editableFileValues.file_name}
                        onChange={(value) =>
                          updateEditableFileValue('file_name', value)
                        }
                      />
                      <EditableField
                        label="Tổng số PDF"
                        value={editableFileValues.number_of_file}
                        onChange={(value) =>
                          updateEditableFileValue('number_of_file', value)
                        }
                      />
                      <EditableField
                        label="Số PDF đã nhập"
                        value={editableFileValues.number_of_file_done}
                        onChange={(value) =>
                          updateEditableFileValue('number_of_file_done', value)
                        }
                      />
                      <EditableField
                        label="Creator UID"
                        value={editableFileValues.creator_uid}
                        onChange={(value) =>
                          updateEditableFileValue('creator_uid', value)
                        }
                      />
                      <EditableField
                        label="Updated UID"
                        value={editableFileValues.updated_uid}
                        onChange={(value) =>
                          updateEditableFileValue('updated_uid', value)
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Storage provider
                        </label>
                        <select
                          value={editableFileValues.storage_provider}
                          onChange={(event) =>
                            updateEditableFileValue(
                              'storage_provider',
                              event.target.value
                            )
                          }
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        >
                          <option value="firebase_storage">
                            firebase_storage / local server
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                      <p>File UID: {fileRecord.uid}</p>
                    </div>

                    <Button
                      type="button"
                      className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700"
                      disabled={isUpdatingFileRecord}
                      onClick={handleSaveFile}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isUpdatingFileRecord
                        ? 'Đang lưu File...'
                        : 'Lưu thông tin File'}
                    </Button>
                  </div>
                </section>
              )}

              {documents.length > 0 ? (
                documents.map(
                  (documentRecord: DocumentRecord, index: number) => {
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
                                {index + 1}.{' '}
                                {fileRecord?.file_name || documentRecord.uid}
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
                      </section>
                    )
                  }
                )
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                  File này chưa có PDF nào.
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
