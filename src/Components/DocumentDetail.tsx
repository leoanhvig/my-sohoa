import { getDocumentByUid } from '@/apis/document'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from './ui/button'

const DOCUMENT_TYPES = [
  'Nghị quyết',
  'Quyết định',
  'Chỉ thị',
  'Quy chế',
  'Quy định',
  'Thông cáo',
  'Thông báo',
  'Hướng dẫn',
  'Chương trình',
  'Kế hoạch',
  'Phương án',
  'Đề án',
  'Dự án',
  'Báo cáo',
  'Tờ trình',
  'Giấy ủy quyền',
  'Phiếu gửi',
  'Phiếu chuyển',
  'Phiếu báo',
  'Biên bản',
  'Hợp đồng',
  'Công văn',
  'Công điện',
  'Bản ghi nhớ',
  'Bản thỏa thuận',
  'Giấy mời',
  'Giấy giới thiệu',
  'Giấy nghỉ phép',
  'Thư công',
  'Bản đồ',
  'Bản vẽ kỹ thuật',
  'Khác',
]

const DOCUMENT_ORIGINAL_TYPES = [
  'Bản chính',
  'Bản sao',
  'Bản thảo',
  'Bản gốc',
  'Bản photo',
]

const SECURITY_LEVELS = ['Thường', 'Mật', 'Tối mật', 'Tuyệt mật']

export default function DocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const {
    data: documentRecord,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => getDocumentByUid(documentId || ''),
    enabled: Boolean(documentId),
  })

  const previewUrl = getPreviewUrl(documentRecord)

  const handleApprove = () => {
    window.alert('Chức năng lưu & duyệt sẽ được kết nối sau.')
  }

  const handleReject = () => {
    const reason = window.prompt('Vui lòng nhập lý do báo lỗi/trả về:')

    if (reason?.trim()) {
      window.alert(`Đã ghi nhận lý do báo lỗi: ${reason.trim()}`)
    }
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <header className="z-10 flex min-h-[56px] items-center justify-between gap-4 bg-amber-400 px-3 py-2 text-slate-950 shadow-md">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-8 shrink-0 border-slate-900 bg-transparent px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Về Dashboard
          </Button>

          <div className="flex min-w-0 items-center gap-2 text-sm font-bold">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {documentRecord?.relative_path ||
                documentRecord?.file_name ||
                'Đang tải hồ sơ...'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(380px,1fr)]">
        <section className="min-h-[45vh] border-r border-slate-300 bg-slate-500 md:min-h-0">
          {isLoading && (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải file...
            </div>
          )}

          {error && (
            <StatusMessage
              tone="error"
              message="Không tải được thông tin hồ sơ."
            />
          )}

          {!isLoading && !error && !documentRecord && (
            <StatusMessage tone="warning" message="Không tìm thấy hồ sơ." />
          )}

          {documentRecord && previewUrl && (
            <iframe
              title={documentRecord.file_name || 'Document preview'}
              src={previewUrl}
              className="h-full w-full border-0"
            />
          )}

          {documentRecord && !previewUrl && (
            <StatusMessage
              tone="warning"
              message="Hồ sơ chưa có đường dẫn xem trước."
            />
          )}
        </section>

        <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
          <h1 className="mb-5 flex items-center gap-2 text-xl font-bold text-blue-700">
            <FileText className="h-5 w-5" /> Kiểm tra & Chỉnh sửa Dữ liệu
          </h1>

          <form
            className="space-y-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-4">
                <FieldSelect
                  label="Tên loại tài liệu"
                  required
                  defaultValue=""
                  options={DOCUMENT_TYPES}
                />
                <FieldInput label="Số của tài liệu (nếu có)" />
                <FieldInput
                  label="Ký hiệu của tài liệu (nếu có)"
                  defaultValue={documentRecord?.so_ky_hieu}
                />
                <FieldInput
                  label="Ngày, tháng, năm tài liệu"
                  defaultValue={documentRecord?.ngay_thang}
                  placeholder="dd/mm/yyyy, mm/yyyy hoặc yyyy"
                />
                <FieldInput
                  label="Tên cơ quan, tổ chức, cá nhân ban hành tài liệu"
                  defaultValue={documentRecord?.tac_gia}
                />
                <FieldTextarea
                  label="Trích yếu nội dung"
                  defaultValue={documentRecord?.trich_yeu}
                />
                <FieldInput
                  label="Tờ số/trang số"
                  required
                  defaultValue={documentRecord?.so_to || ''}
                />
                <FieldSelect
                  label="Loại văn bản"
                  required
                  defaultValue=""
                  options={DOCUMENT_ORIGINAL_TYPES}
                />
                <FieldInput label="Tên người ký văn bản" />
                <FieldSelect
                  label="Độ mật"
                  defaultValue=""
                  options={SECURITY_LEVELS}
                />
                <FieldInput label="Ký hiệu thông tin" />
                <FieldInput label="Từ khóa" />
              </div>
            </div>

            <div className="flex gap-3 pb-4">
              <Button
                type="button"
                className="h-11 flex-1 bg-emerald-600 font-bold shadow hover:bg-emerald-700"
                onClick={handleApprove}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> LƯU & DUYỆT NGAY
              </Button>
              <Button
                type="button"
                className="h-11 bg-red-600 font-bold shadow hover:bg-red-700"
                onClick={handleReject}
              >
                <XCircle className="mr-2 h-5 w-5" /> BÁO LỖI
              </Button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  )
}

function FieldInput({
  label,
  defaultValue = '',
  placeholder,
  required = false,
}: {
  label: string
  defaultValue?: string | number
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <Label label={label} required={required} />
      <input
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 h-10 w-full rounded-md border border-blue-500 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  )
}

function FieldTextarea({
  label,
  defaultValue = '',
}: {
  label: string
  defaultValue?: string
}) {
  return (
    <div>
      <Label label={label} />
      <textarea
        defaultValue={defaultValue}
        rows={4}
        className="mt-1.5 w-full rounded-md border border-blue-500 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  )
}

function FieldSelect({
  label,
  options,
  defaultValue,
  required = false,
}: {
  label: string
  options: string[]
  defaultValue?: string
  required?: boolean
}) {
  return (
    <div>
      <Label label={label} required={required} />
      <select
        defaultValue={defaultValue}
        className="mt-1.5 h-10 w-full rounded-md border border-blue-500 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      >
        <option value="">-- Chọn --</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function Label({
  label,
  required = false,
}: {
  label: string
  required?: boolean
}) {
  return (
    <label className="text-sm font-bold text-slate-800">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
  )
}

function StatusMessage({
  message,
  tone,
}: {
  message: string
  tone: 'error' | 'warning'
}) {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div
        className={`rounded-md border px-4 py-3 text-sm font-semibold ${className}`}
      >
        {message}
      </div>
    </div>
  )
}

function getPreviewUrl(
  documentRecord: Awaited<ReturnType<typeof getDocumentByUid>> | undefined
) {
  if (!documentRecord) {
    return ''
  }

  if (documentRecord.drive_file_id) {
    return `https://drive.google.com/file/d/${documentRecord.drive_file_id}/preview`
  }

  return documentRecord.download_url || documentRecord.drive_web_view_link || ''
}
