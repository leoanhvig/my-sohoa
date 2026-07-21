import { Eye, FileText, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { FileRecord } from '../apis/file'
import { useAllHoTichFiles } from '../hooks/useAllHoTichFiles'
import { Button } from './ui/button'

export default function FileHoTichs() {
  const navigate = useNavigate()
  const { data: files = [], isLoading, error } = useAllHoTichFiles()
  const allFiles = files as FileRecord[]

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
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="m-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error instanceof Error ? error.message : 'Không tải được Hộ tịch.'}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">Tên file</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">Tiến độ</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">Người nhận</th>
                  <th className="px-6 py-3 text-right font-bold text-slate-600">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center"><span className="inline-flex items-center gap-2 font-semibold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Đang tải...</span></td></tr>
                ) : allFiles.length > 0 ? (
                  allFiles.map((file) => (
                    <tr key={file.uid} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-indigo-500" /><div><div className="font-bold text-slate-900">{file.file_name}</div><div className="text-xs text-slate-500">ID: {file.uid}</div></div></div></td>
                      <td className="px-6 py-4 font-bold text-slate-700">{file.number_of_file_done || 0}/{file.number_of_file || 0}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{file.enteredByUserId || 'Chưa phân công'}</td>
                      <td className="px-6 py-4 text-right"><Button type="button" size="sm" variant="outline" onClick={() => navigate(`/file-hotich/${file.uid}`)}><Eye className="mr-2 h-4 w-4" /> Xem</Button></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">Chưa có Hộ tịch nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}