import { Download, Eye, FileText, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileRecord } from '../apis/file'
import { useAllFiles } from '../hooks/useAllFiles'
import { Button } from './ui/button'

type FileTab = 'pending' | 'done'

function isDoneFile(file: FileRecord): boolean {
  const totalFiles = file.number_of_file || 0
  const doneFiles = file.number_of_file_done || 0

  return totalFiles > 0 && doneFiles >= totalFiles
}

function exportFile(file: FileRecord) {
  const rows = [
    ['ID', file.uid],
    ['File name', file.file_name],
    ['Total files', String(file.number_of_file || 0)],
    ['Done files', String(file.number_of_file_done || 0)],
    ['Updated user', file.updated_uid || ''],
    ['Drive folder', file.drive_folder_link || ''],
  ]
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${file.file_name || file.uid}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function Files() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<FileTab>('pending')
  const { data: files = [], isLoading, error } = useAllFiles()
  const allFiles = files as FileRecord[]

  const doneFiles = useMemo(() => allFiles.filter(isDoneFile), [allFiles])
  const pendingFiles = useMemo(
    () => allFiles.filter((file: FileRecord) => !isDoneFile(file)),
    [allFiles]
  )
  const displayFiles = activeTab === 'done' ? doneFiles : pendingFiles

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Tất cả hồ sơ
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Danh sách toàn bộ File, chia theo trạng thái đã hoàn thành hoặc
                chưa hoàn thành.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              Tổng: {allFiles.length} file
            </div>
          </div>

          <div className="mt-6 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={
                activeTab === 'pending'
                  ? 'rounded-md bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm'
                  : 'rounded-md px-4 py-2 text-sm font-bold text-slate-500 transition hover:text-slate-900'
              }
            >
              Chưa ({pendingFiles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('done')}
              className={
                activeTab === 'done'
                  ? 'rounded-md bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm'
                  : 'rounded-md px-4 py-2 text-sm font-bold text-slate-500 transition hover:text-slate-900'
              }
            >
              Done ({doneFiles.length})
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="m-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error instanceof Error ? error.message : 'Failed to load files.'}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Tên file
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    User nhận
                  </th>
                  <th className="px-6 py-3 text-right font-bold text-slate-600">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                      </span>
                    </td>
                  </tr>
                ) : displayFiles.length > 0 ? (
                  displayFiles.map((file: FileRecord) => (
                    <tr key={file.uid} className="transition hover:bg-slate-50">
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
                        {file.number_of_file_done || 0}/
                        {file.number_of_file || 0}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {file.updated_uid || 'Chưa có'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          {activeTab === 'done' && (
                            <Button
                              type="button"
                              size="sm"
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={() => exportFile(file)}
                            >
                              <Download className="mr-2 h-4 w-4" /> Export file
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/file/${file.uid}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      Không có hồ sơ nào.
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
