import { Button } from '@/Components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form'
import type { DocumentRecordFormValues } from '../types'
import { FieldInput, FieldTextarea } from './DocumentRecordFormFields'

type DocumentRecordFormProps = {
  formKey: number
  errors: FieldErrors<DocumentRecordFormValues>
  register: UseFormRegister<DocumentRecordFormValues>
  handleSubmit: UseFormHandleSubmit<DocumentRecordFormValues>
  onApprove: (values: DocumentRecordFormValues) => void
}

export function DocumentRecordForm({
  formKey,
  errors,
  register,
  handleSubmit,
  onApprove,
}: DocumentRecordFormProps) {
  return (
    <form
      key={formKey}
      className="space-y-5"
      onSubmit={handleSubmit(onApprove)}
    >
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          <FieldInput
            label="Tác giả"
            error={errors.tacGia?.message}
            registration={register('tacGia')}
          />
          <FieldInput
            label="Tờ số/trang số"
            required
            error={errors.soTo?.message}
            registration={register('soTo', {
              required: 'Tờ số/trang số là bắt buộc',
            })}
          />
          <FieldInput
            label="Số, ký hiệu văn bản"
            error={errors.soKyHieu?.message}
            registration={register('soKyHieu')}
          />
          <FieldInput
            label="Ngày, tháng, năm tài liệu"
            placeholder="dd/mm/yyyy, mm/yyyy hoặc yyyy"
            error={errors.ngayThang?.message}
            registration={register('ngayThang')}
          />
          <FieldTextarea
            label="Trích yếu nội dung"
            error={errors.trichYeu?.message}
            registration={register('trichYeu')}
          />
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <Button
          type="button"
          className="h-11 flex-1 bg-emerald-600 font-bold shadow hover:bg-emerald-700"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" /> lưu và chuyển trang
        </Button>
        <Button
          type="submit"
          className="h-11 flex-1 bg-emerald-600 font-bold shadow hover:bg-emerald-700"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" /> lưu và thêm 1 dòng mới
        </Button>
      </div>
    </form>
  )
}
