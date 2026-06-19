import { Button } from '@/Components/ui/button'
import { PlusCircle } from 'lucide-react'
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form'
import { defaultRecordFormValues } from '../constants'
import type { DocumentRecordFormValues } from '../types'
import { DocumentRecordForm } from './DocumentRecordForm'

type DocumentRecordPanelProps = {
  isOpen: boolean
  formKey: number
  errors: FieldErrors<DocumentRecordFormValues>
  register: UseFormRegister<DocumentRecordFormValues>
  handleSubmit: UseFormHandleSubmit<DocumentRecordFormValues>
  onApprove: (values: DocumentRecordFormValues) => void
  onOpenForm: () => void
  reset: (values: DocumentRecordFormValues) => void
}

export function DocumentRecordPanel({
  isOpen,
  formKey,
  errors,
  register,
  handleSubmit,
  onApprove,
  onOpenForm,
  reset,
}: DocumentRecordPanelProps) {
  return (
    <aside className="min-h-0 overflow-auto bg-slate-50 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-900">Record dữ liệu</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thêm record mới cho hồ sơ đang xem.
          </p>
        </div>
        {!isOpen && (
          <Button
            type="button"
            className="shrink-0 bg-blue-600 font-bold hover:bg-blue-700"
            onClick={() => {
              reset(defaultRecordFormValues)
              onOpenForm()
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm record
          </Button>
        )}
      </div>

      {isOpen && (
        <DocumentRecordForm
          formKey={formKey}
          errors={errors}
          register={register}
          handleSubmit={handleSubmit}
          onApprove={onApprove}
        />
      )}
    </aside>
  )
}
