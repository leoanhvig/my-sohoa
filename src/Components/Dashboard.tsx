import {
  CalendarDays,
  Clock3,
  Eye,
  FilePenLine,
  Filter,
  Pencil,
  PlayCircle,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'
import { Input } from './ui/input'

const documents = [
  {
    id: 52905,
    fileName: 'CSDL_SOHOA_BD/An Lap/C3/33.pdf',
    updatedAt: '17/06 13:21',
    status: 'Đang duyệt 1',
    statusType: 'checking',
    edited: false,
    action: 'Sửa / Duyệt',
  },
  {
    id: 52893,
    fileName: 'CSDL_SOHOA_BD/An Lap/C3/21.pdf',
    updatedAt: '17/06 13:21',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52881,
    fileName: 'CSDL_SOHOA_BD/An Lap/C3/09.pdf',
    updatedAt: '17/06 13:21',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52890,
    fileName: 'CSDL_SOHOA_BD/An Lap/C3/18.pdf',
    updatedAt: '17/06 13:19',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52886,
    fileName: 'CSDL_SOHOA_BD/An Lap/C3/14.pdf',
    updatedAt: '17/06 13:19',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52863,
    fileName: 'CSDL_SOHOA_BD/An Lap/C29/64.pdf',
    updatedAt: '17/06 13:17',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52859,
    fileName: 'CSDL_SOHOA_BD/An Lap/C29/60.pdf',
    updatedAt: '17/06 13:11',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52837,
    fileName: 'CSDL_SOHOA_BD/An Lap/C29/38.pdf',
    updatedAt: '17/06 13:11',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52833,
    fileName: 'CSDL_SOHOA_BD/An Lap/C29/34.pdf',
    updatedAt: '17/06 13:07',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
  {
    id: 52831,
    fileName: 'CSDL_SOHOA_BD/An Lap/C29/32.pdf',
    updatedAt: '17/06 13:06',
    status: 'Chờ duyệt 2',
    statusType: 'pending',
    edited: true,
    action: 'Xem Chi Tiết',
  },
]

const statusOptions = [
  '-- Tất cả trạng thái --',
  'Mới (New)',
  'Đang nhập (Processing)',
  'Chờ duyệt 1 (Pending)',
  'Đang duyệt 1 (Checking)',
  'Chờ duyệt 2 (Check 1)',
  'Đang duyệt 2 (Checking 2)',
  'Hoàn thành (Done)',
  'Lỗi PDF (Error PDF)',
  'Bị lỗi (Error)',
  'Đang khiếu nại (Appeal)',
]

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-indigo-600 p-6 text-white">
            <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Xin chào, CK009!
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-indigo-100">
                  <UserRoundCheck className="h-4 w-4" /> Vai trò: CHECK
                </p>
              </div>

              <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[220px_220px_1fr_auto] xl:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    name="search"
                    className="bg-white pl-9 font-semibold text-slate-900"
                    placeholder="Tìm tên file..."
                  />
                </div>

                <select
                  name="status"
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                  defaultValue=""
                >
                  {statusOptions.map((option, index) => (
                    <option key={option} value={index === 0 ? '' : option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="grid gap-2 rounded-md bg-white p-2 text-slate-900 shadow-sm sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    Từ:
                    <input
                      type="date"
                      name="start_date"
                      className="min-w-0 flex-1 border-0 p-0 text-sm font-bold text-indigo-600 outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-2 border-slate-200 text-xs font-bold text-slate-500 sm:border-l sm:pl-3">
                    Đến:
                    <input
                      type="date"
                      name="end_date"
                      className="min-w-0 flex-1 border-0 p-0 text-sm font-bold text-indigo-600 outline-none"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                >
                  <Filter className="h-4 w-4" /> Lọc
                </button>

                <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-white md:col-span-2 xl:col-span-4 xl:justify-end">
                  <input
                    type="checkbox"
                    name="is_edited"
                    className="h-5 w-10 cursor-pointer rounded-full border-transparent text-indigo-900 focus:ring-white"
                  />
                  Chỉ hiện file Đã sửa
                </label>
              </form>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
              <div className="text-4xl font-extrabold text-emerald-600">98</div>
              <div className="mt-2 text-xs font-bold uppercase text-slate-500">
                Tiến độ: 17/06
              </div>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
              <h2 className="mb-4 text-center text-lg font-bold text-slate-900">
                Chất lượng duyệt
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-sky-100 pb-2">
                  <dt className="font-bold text-slate-500">Tổng đã nghiệm thu:</dt>
                  <dd className="font-bold">98</dd>
                </div>
                <div className="flex justify-between border-b border-sky-100 pb-2">
                  <dt className="font-bold text-emerald-600">Duyệt chuẩn:</dt>
                  <dd className="font-bold text-emerald-600">98</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-bold text-red-600">Duyệt sai sót:</dt>
                  <dd className="font-bold text-red-600">0</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
              <div className="text-4xl font-extrabold text-amber-500">5997</div>
              <div className="mt-2 text-xs font-bold uppercase text-slate-500">
                Hồ sơ chờ lấy
              </div>
              <a
                href="/checker/workspace"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-amber-500"
              >
                <PlayCircle className="h-4 w-4" /> LẤY HỒ SƠ KIỂM TRA
              </a>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-600">
              <Clock3 className="h-5 w-5" /> Danh sách hồ sơ
            </h2>
            <span className="w-fit rounded-full bg-slate-600 px-3 py-1 text-xs font-bold text-white">
              Tổng: 99 file
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Tên File / ID
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Cập nhật cuối
                  </th>
                  <th className="px-6 py-3 text-left font-bold text-slate-600">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right font-bold text-slate-600">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {documents.map((document) => (
                  <tr key={document.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-900">
                            {document.fileName}
                          </div>
                          <div className="text-xs text-slate-500">
                            ID: {document.id}
                          </div>
                        </div>
                        {document.edited && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800 shadow-sm">
                            <Pencil className="h-3 w-3" /> Đã được sửa DL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        {document.updatedAt}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          document.statusType === 'checking'
                            ? 'inline-flex items-center gap-1 rounded-full bg-slate-600 px-2.5 py-1 text-xs font-bold text-white'
                            : 'inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800'
                        }
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> {document.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/workspace?doc_id=${document.id}`}
                        className={
                          document.action === 'Sửa / Duyệt'
                            ? 'inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50'
                            : 'inline-flex items-center gap-2 rounded-md border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50'
                        }
                      >
                        {document.action === 'Sửa / Duyệt' ? (
                          <FilePenLine className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        {document.action}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center border-t border-slate-100 px-6 py-4">
            <nav className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white text-sm shadow-sm">
              {['«', '1', '2', '3', '...', '10', '»'].map((page, index) => (
                <button
                  key={`${page}-${index}`}
                  type="button"
                  disabled={page === '«' || page === '...'}
                  className={
                    page === '1'
                      ? 'border-r border-slate-200 bg-indigo-600 px-3 py-2 font-bold text-white last:border-r-0'
                      : 'border-r border-slate-200 px-3 py-2 font-bold text-slate-600 transition last:border-r-0 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300'
                  }
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </main>
  )
}
