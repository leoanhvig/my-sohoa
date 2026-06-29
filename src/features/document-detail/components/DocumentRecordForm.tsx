import { useEffect, useState } from 'react'
import { defaultRecordFormValues } from '../constants'
import type { DocumentRecordFormValues } from '../types'
import { DocumentDetailForm } from './DocumentDetailForm'

type DocumentRecordFormProps = {
  formKey: number | string | undefined
  resetKey?: string
  initialValues?: DocumentRecordFormValues
  onApprove: (values: DocumentRecordFormValues) => void | Promise<void>
  isSaving: boolean
  submitLabel?: string
  submittingLabel?: string
  onCancel?: () => void
}

export function DocumentRecordForm({
  formKey,
  resetKey,
  initialValues,
  onApprove,
  isSaving,
  submitLabel,
  submittingLabel,
  onCancel,
}: DocumentRecordFormProps) {
  const [values, setValues] = useState<DocumentRecordFormValues>(
    initialValues || defaultRecordFormValues
  )

  useEffect(() => {
    setValues(initialValues || defaultRecordFormValues)
  }, [formKey, resetKey])

  async function handleSubmit() {
    await onApprove(values)
  }

  return (
    <div key={formKey} className="space-y-5">
      <DocumentDetailForm
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
        onCancel={onCancel}
      />
    </div>
  )
}
