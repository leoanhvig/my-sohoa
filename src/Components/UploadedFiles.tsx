import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocumentsByUidFile, getDocumentsCount } from '../apis/document'
import { FileRecord, updateFileRecordInfo } from '../apis/file'
import { getAllUsers, type UserRecord } from '../apis/user'
import { useAllFiles } from '../hooks/useAllFiles'
import { useDeleteFileRecord } from '../hooks/useDeleteFileRecord'
import { Button } from './ui/button'
import { Input } from './ui/input'

function isLocalUploadedFile(file: FileRecord): boolean {
  return file.storage_provider === 'firebase_storage'
}

function getCompletedPercent(file: FileRecord): number {
  const total = file.number_of_file || 0

  if (total === 0) {
    return 0
  }

  return Math.min(
    100,
    Math.round(((file.number_of_file_done || 0) / total) * 100)
  )
}

function getSafeExcelFileName(fileName: string): string {
  return (fileName || 'documents').replace(/[\\/:*?"<>|]/g, '-').trim()
}

function formatExportDate(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString('vi-VN')
  }

  if (value && typeof value === 'object' && 'toMillis' in value) {
    return new Date(
      (value as { toMillis: () => number }).toMillis()
    ).toLocaleString('vi-VN')
  }

  if (value instanceof Date) {
    return value.toLocaleString('vi-VN')
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsedDate = new Date(value)

    return Number.isNaN(parsedDate.getTime())
      ? String(value)
      : parsedDate.toLocaleString('vi-VN')
  }

  return ''
}

function isCompletedFile(file: FileRecord): boolean {
  const total = file.number_of_file || 0
  const done = file.number_of_file_done || 0

  return Boolean(file.is_completed) || (total > 0 && done >= total)
}

function getUpdatedAtTime(file: FileRecord): number {
  const updatedAt = file.updated_at as unknown

  if (updatedAt && typeof updatedAt === 'object' && 'toMillis' in updatedAt) {
    return (updatedAt as { toMillis: () => number }).toMillis()
  }

  if (updatedAt instanceof Date) {
    return updatedAt.getTime()
  }

  if (typeof updatedAt === 'string' || typeof updatedAt === 'number') {
    const parsedTime = new Date(updatedAt).getTime()

    return Number.isNaN(parsedTime) ? 0 : parsedTime
  }

  return 0
}

function sortCompletedFiles(files: FileRecord[]): FileRecord[] {
  return [...files].sort((firstFile, secondFile) => {
    if (Boolean(firstFile.isExported) !== Boolean(secondFile.isExported)) {
      return firstFile.isExported ? 1 : -1
    }

    return getUpdatedAtTime(secondFile) - getUpdatedAtTime(firstFile)
  })
}

export default function UploadedFiles() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>(
    'in-progress'
  )
  const [exportingFileUid, setExportingFileUid] = useState('')
  const [isExportingFilesCollection, setIsExportingFilesCollection] =
    useState(false)
  const { data: files = [], isLoading, error } = useAllFiles()
  const { deleteFileRecord, deletingFileUid } = useDeleteFileRecord()
  const { data: totalDocumentRecords = 0, isLoading: isLoadingDocumentsCount } =
    useQuery<number>({
      queryKey: ['documents', 'total-count'],
      queryFn: getDocumentsCount,
    })
  const { data: users = [] } = useQuery<UserRecord[]>({
    queryKey: ['users', 'all'],
    queryFn: getAllUsers,
  })
  const allFiles = files as FileRecord[]
  const userNameByUid = useMemo<Map<string, string>>(
    () =>
      new Map(
        users.map((user: UserRecord) => [user.uid, user.user_name] as const)
      ),
    [users]
  )

  const localFiles = useMemo(
    () => allFiles.filter(isLocalUploadedFile),
    [allFiles]
  )
  const inProgressFiles = useMemo(
    () => localFiles.filter((file) => !isCompletedFile(file)),
    [localFiles]
  )
  const completedFiles = useMemo(
    () => sortCompletedFiles(localFiles.filter(isCompletedFile)),
    [localFiles]
  )
  const filteredFiles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    const filesByTab =
      activeTab === 'completed' ? completedFiles : inProgressFiles

    if (!keyword) {
      return filesByTab
    }

    return filesByTab.filter(
      (file) =>
        file.file_name.toLowerCase().includes(keyword) ||
        file.uid.toLowerCase().includes(keyword) ||
        (userNameByUid.get(file.enteredByUserId) || '')
          .toLowerCase()
          .includes(keyword)
    )
  }, [activeTab, completedFiles, inProgressFiles, searchText, userNameByUid])

  async function handleExportFile(file: FileRecord) {
    try {
      const uid = file.uid
      setExportingFileUid(uid)
      const [documents, XLSX] = await Promise.all([
        getDocumentsByUidFile(uid),
        import('xlsx'),
      ])
      const worksheet = XLSX.utils.aoa_to_sheet([
        [
          'Số, ký hiệu văn bản',
          'Ngày, tháng, năm tài liệu',
          'Trích yếu nội dung',
          'Cơ quan ban hành',
          'Tờ số/trang số',
        ],
        ...documents.map((documentRecord) => [
          documentRecord.so_ky_hieu || '',
          documentRecord.ngay_thang || '',
          documentRecord.trich_yeu || '',
          documentRecord.co_quan_ban_hanh || '',
          documentRecord.so_to || '',
        ]),
      ])
      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents')
      XLSX.writeFile(workbook, `${getSafeExcelFileName(file.file_name)}.xlsx`)
      await updateFileRecordInfo({
        uid: uid,
        isExported: true,
      })
      await queryClient.invalidateQueries({ queryKey: ['files', 'all'] })
    } catch (err) {
      console.error('Không export được file documents:', err)
    } finally {
      setExportingFileUid('')
    }
  }

  async function handleExportFilesCollection() {
    try {
      setIsExportingFilesCollection(true)
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.aoa_to_sheet([
        [
          'ID',
          'Tên file',
          'Số PDF',
          'Số PDF đã nhập',
          'Tiến độ (%)',
          'Trạng thái hoàn thành',
          'Đã export',
          'Người nhập',
          'ID người nhập',
          'Creator UID',
          'Updated UID',
          'Storage provider',
          'Relative path',
          'Storage path',
          'Download URL',
          'Ngày tạo',
          'Ngày cập nhật',
        ],
        ...allFiles.map((file) => [
          file.uid,
          file.file_name || '',
          file.number_of_file || 0,
          file.number_of_file_done || 0,
          getCompletedPercent(file),
          isCompletedFile(file) ? 'Đã hoàn thành' : 'Đang làm',
          file.isExported ? 'Đã export' : 'Chưa export',
          userNameByUid.get(file.enteredByUserId) || '',
          file.enteredByUserId || '',
          file.creator_uid || '',
          file.updated_uid || '',
          file.storage_provider || '',
          file.relative_path || '',
          file.storage_path || '',
          file.download_url || '',
          formatExportDate(file.created_at),
          formatExportDate(file.updated_at),
        ]),
      ])
      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Files')
      XLSX.writeFile(workbook, 'Files-collection.xlsx')
    } catch (err) {
      console.error('Không export được collection Files:', err)
    } finally {
      setIsExportingFilesCollection(false)
    }
  }

  async function handleDeleteFile(file: FileRecord) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa file "${file.file_name}" không?`
    )

    if (!confirmed) {
      return
    }

    await deleteFileRecord(file.uid)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                <UploadCloud className="h-6 w-6 text-indigo-600" /> File đã
                upload
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Danh sách các bộ PDF upload trực tiếp lên server project.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                Tổng: {localFiles.length} file
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                Tổng documents:{' '}
                {isLoadingDocumentsCount ? 'Đang tải...' : totalDocumentRecords}
              </div>
              <Button
                type="button"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => navigate('/upload')}
              >
                Upload thêm
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={isExportingFilesCollection || allFiles.length === 0}
                onClick={handleExportFilesCollection}
              >
                {isExportingFilesCollection ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Files
              </Button>
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <label htmlFor="uploaded-file-search" className="sr-only">
              Tìm kiếm file đã upload
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="uploaded-file-search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm theo tên file, ID, người tạo..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200">
            <button
              type="button"
              className={`-mb-px rounded-t-lg border px-4 py-2 text-sm font-bold transition ${
                activeTab === 'in-progress'
                  ? 'border-slate-200 border-b-white bg-white text-indigo-700'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
              onClick={() => setActiveTab('in-progress')}
            >
              Đang làm ({inProgressFiles.length})
            </button>
            <button
              type="button"
              className={`-mb-px rounded-t-lg border px-4 py-2 text-sm font-bold transition ${
                activeTab === 'completed'
                  ? 'border-slate-200 border-b-white bg-white text-indigo-700'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Đã hoàn thành ({completedFiles.length})
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="m-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error instanceof Error
                ? error.message
                : 'Không tải được danh sách file.'}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Bộ file
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Số PDF
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Tiến độ nhập
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Người nhập
                  </th>
                  {activeTab === 'completed' && (
                    <th className="px-6 py-3 text-left font-bold text-slate-600">
                      Đã export
                    </th>
                  )}
                  <th className="px-6 py-3 text-right font-bold text-slate-600">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={activeTab === 'completed' ? 6 : 5}
                      className="px-6 py-10 text-center"
                    >
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                      </span>
                    </td>
                  </tr>
                ) : filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => {
                    const percent = getCompletedPercent(file)

                    return (
                      <tr
                        key={file.uid}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
                            <div>
                              <div className="font-bold text-slate-900">
                                {file.file_name}
                              </div>
                              <div className="text-xs text-slate-500">
                                ID: {file.uid}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {file.number_of_file || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="min-w-[180px]">
                            <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
                              <span>
                                {file.number_of_file_done || 0}/
                                {file.number_of_file || 0}
                              </span>
                              <span>{percent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                              <div
                                className="h-2 rounded-full bg-indigo-600"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          {userNameByUid.get(file.enteredByUserId) ||
                            'Chưa có người nhập'}
                        </td>
                        {activeTab === 'completed' && (
                          <td className="px-6 py-4">
                            {file.isExported ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                Exported
                              </span>
                            ) : null}
                          </td>
                        )}
                        <td className="space-x-2 px-6 py-4 text-right">
                          {activeTab === 'in-progress' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={deletingFileUid === file.uid}
                              aria-label={`Xóa file ${file.file_name}`}
                              title={`Xóa file ${file.file_name}`}
                              onClick={() => handleDeleteFile(file)}
                            >
                              {deletingFileUid === file.uid ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            disabled={exportingFileUid === file.uid}
                            aria-label={`Export file ${file.file_name}`}
                            title={`Export file ${file.file_name}`}
                            onClick={() => handleExportFile(file)}
                          >
                            {exportingFileUid === file.uid ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={`Xem chi tiết file ${file.file_name}`}
                            title={`Xem chi tiết file ${file.file_name}`}
                            onClick={() => navigate(`/file/${file.uid}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === 'completed' ? 6 : 5}
                      className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      {activeTab === 'completed'
                        ? 'Chưa có file PDF local nào đã hoàn thành.'
                        : 'Chưa có file PDF local nào đang làm.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
