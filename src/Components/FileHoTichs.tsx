import { Download, Eye, FileText, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHoTichDocumentsByUidFile } from '../apis/document'
import { type FileRecord, updateHoTichFileRecordInfo } from '../apis/file'
import { useAllHoTichFiles } from '../hooks/useAllHoTichFiles'
import { Button } from './ui/button'

function getSafeExcelFileName(fileName: string): string {
  return (fileName || 'ho-so-ho-tich').replace(/[\\/:*?"<>|]/g, '-').trim()
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

  return 0
}

export default function FileHoTichs() {
  const navigate = useNavigate()
  const { data: files = [], isLoading, error } = useAllHoTichFiles()
  const allFiles = files as FileRecord[]
  const [exportingFileUid, setExportingFileUid] = useState('')
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>(
    'in-progress'
  )
  const inProgressFiles = useMemo(
    () => allFiles.filter((file) => !isCompletedFile(file)),
    [allFiles]
  )
  const completedFiles = useMemo(
    () =>
      allFiles.filter(isCompletedFile).sort((firstFile, secondFile) => {
        if (Boolean(firstFile.isExported) !== Boolean(secondFile.isExported)) {
          return firstFile.isExported ? 1 : -1
        }

        return getUpdatedAtTime(secondFile) - getUpdatedAtTime(firstFile)
      }),
    [allFiles]
  )
  const displayFiles =
    activeTab === 'completed' ? completedFiles : inProgressFiles

  async function handleExportFile(file: FileRecord) {
    try {
      setExportingFileUid(file.uid)
      const [documents, XLSX] = await Promise.all([
        getHoTichDocumentsByUidFile(file.uid),
        import('xlsx'),
      ])
      const worksheet = XLSX.utils.aoa_to_sheet([
        [
          'STT',
          'Loại hồ sơ',
          'Tiêu đề',
          'Số, ký hiệu văn bản',
          'Ngày tháng đăng ký',
          'Số tờ',
          'Tên người A',
          'Tên người B',
          'Tên người khai sinh',
          'Ngày sinh',
          'Tên người mất',
          'Ngày mất',
          'Tên người nhận nuôi',
          'Tên người được nhận nuôi',
          'ID người nhập',
        ],
        ...documents.map((document, index) => [
          index + 1,
          document.type,
          document.title,
          document.document_number,
          document.registered_date,
          document.page_number,
          document.person_a,
          document.person_b,
          document.child_name,
          document.birth_date,
          document.deceased_name,
          document.death_date,
          document.adopter_name,
          document.adopted_name,
          document.entered_by_uid,
        ]),
      ])
      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ho tich')
      XLSX.writeFile(
        workbook,
        `${getSafeExcelFileName(file.file_name)}-ho-tich.xlsx`
      )
      await updateHoTichFileRecordInfo({ uid: file.uid, isExported: true })
    } catch (exportError) {
      console.error('Không export được hồ sơ Hộ tịch:', exportError)
    } finally {
      setExportingFileUid('')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Danh sách Hộ tịch
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Các bộ PDF được lưu trong collection FileHoTichs.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              Tổng: {allFiles.length} file
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
              Chưa hoàn thành ({inProgressFiles.length})
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
                : 'Không tải được Hộ tịch.'}
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
                    Người nhận
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
                      colSpan={activeTab === 'completed' ? 5 : 4}
                      className="px-6 py-10 text-center"
                    >
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                      </span>
                    </td>
                  </tr>
                ) : displayFiles.length > 0 ? (
                  displayFiles.map((file) => (
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
                        {file.enteredByUserId || 'Chưa phân công'}
                      </td>
                      {activeTab === 'completed' && (
                        <td className="px-6 py-4">
                          {file.isExported ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              Đã export
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                              Chưa export
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            disabled={exportingFileUid === file.uid}
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
                            onClick={() => navigate(`/file-hotich/${file.uid}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Xem
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === 'completed' ? 5 : 4}
                      className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      {activeTab === 'completed'
                        ? 'Chưa có Hộ tịch nào đã hoàn thành.'
                        : 'Chưa có Hộ tịch nào chưa hoàn thành.'}
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
