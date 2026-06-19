import type { UseFormRegisterReturn } from 'react-hook-form'

type FieldInputProps = {
  label: string
  placeholder?: string
  required?: boolean
  error?: string
  registration: UseFormRegisterReturn
}

type FieldTextareaProps = {
  label: string
  error?: string
  registration: UseFormRegisterReturn
}

export function FieldInput({
  label,
  placeholder,
  required = false,
  error,
  registration,
}: FieldInputProps) {
  return (
    <div>
      <Label label={label} required={required} />
      <input
        type="text"
        placeholder={placeholder}
        {...registration}
        className="mt-1.5 h-10 w-full rounded-md border border-blue-500 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function FieldTextarea({
  label,
  error,
  registration,
}: FieldTextareaProps) {
  return (
    <div>
      <Label label={label} />
      <textarea
        rows={4}
        {...registration}
        className="mt-1.5 w-full rounded-md border border-blue-500 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
