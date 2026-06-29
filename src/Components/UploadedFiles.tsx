import { useQuery } from '@tanstack/react-query'
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  UploadCloud,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocumentsByUidFile } from '../apis/document'
import { FileRecord } from '../apis/file'
import { getAllUsers, type UserRecord } from '../apis/user'
import { useAllFiles } from '../hooks/useAllFiles'
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

export default function UploadedFiles() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [exportingFileUid, setExportingFileUid] = useState('')
  const { data: files = [], isLoading, error } = useAllFiles()
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
  const filteredFiles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    if (!keyword) {
      return localFiles
    }

    return localFiles.filter(
      (file) =>
        file.file_name.toLowerCase().includes(keyword) ||
        file.uid.toLowerCase().includes(keyword) ||
        (userNameByUid.get(file.enteredByUserId) || '')
          .toLowerCase()
          .includes(keyword)
    )
  }, [localFiles, searchText, userNameByUid])

  async function handleExportFile(file: FileRecord) {
    try {
      setExportingFileUid(file.uid)
      const [documents, XLSX] = await Promise.all([
        getDocumentsByUidFile(file.uid),
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
    } catch (err) {
      console.error('Không export được file documents:', err)
    } finally {
      setExportingFileUid('')
    }
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
                Tổng: {localFiles.length} bộ file
              </div>
              <Button
                type="button"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => navigate('/upload')}
              >
                Upload thêm
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
                  <th className="px-6 py-3 text-right font-bold text-slate-600">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
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
                        <td className="space-x-2 px-6 py-4 text-right">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            disabled={exportingFileUid === file.uid}
                            onClick={() => handleExportFile(file)}
                          >
                            {exportingFileUid === file.uid ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="mr-2 h-4 w-4" />
                            )}
                            Export file
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/file/${file.uid}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      Chưa có file PDF local nào được upload.
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
