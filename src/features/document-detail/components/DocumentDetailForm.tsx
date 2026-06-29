import { Button } from '@/Components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import type { FormEvent } from 'react'
import type { DocumentRecordFormValues } from '../types'

type DocumentDetailFormProps = {
  values: DocumentRecordFormValues
  onChange: (values: DocumentRecordFormValues) => void
  onSubmit: () => void | Promise<void>
  isSubmitting: boolean
  submitLabel?: string
  submittingLabel?: string
  onCancel?: () => void
}

export function DocumentDetailForm({
  values,
  onChange,
  onSubmit,
  isSubmitting,
  submitLabel = 'lưu và thêm 1 dòng mới',
  submittingLabel = 'đang lưu...',
  onCancel,
}: DocumentDetailFormProps) {
  function updateField(
    field: keyof DocumentRecordFormValues,
    value: string
  ): void {
    onChange({
      ...values,
      [field]: value,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          <EditableField
            label="Cơ quan ban hành"
            value={values.coQuanBanHanh}
            onChange={(value) => updateField('coQuanBanHanh', value)}
          />
          <EditableField
            label="Tờ số/trang số"
            value={values.soTo}
            required
            onChange={(value) => updateField('soTo', value)}
          />
          <EditableField
            label="Số, ký hiệu văn bản"
            value={values.soKyHieu}
            onChange={(value) => updateField('soKyHieu', value)}
          />
          <EditableField
            label="Ngày, tháng, năm tài liệu"
            value={values.ngayThang}
            placeholder="dd/mm/yyyy, mm/yyyy hoặc yyyy"
            onChange={(value) => updateField('ngayThang', value)}
          />
          <EditableTextarea
            label="Trích yếu nội dung"
            value={values.trichYeu}
            onChange={(value) => updateField('trichYeu', value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 font-bold shadow"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Hủy cập nhật
          </Button>
        )}
        <Button
          type="submit"
          className="h-11 flex-1 bg-emerald-600 font-bold shadow hover:bg-emerald-700"
          disabled={isSubmitting}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />{' '}
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <Label label={label} required={required} />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full rounded-md border border-blue-500 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
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
    <div>
      <Label label={label} />
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-md border border-blue-500 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      />
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
