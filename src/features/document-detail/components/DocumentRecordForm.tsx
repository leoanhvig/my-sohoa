import { useEffect, useState } from 'react'
import { defaultRecordFormValues } from '../constants'
import type { DocumentRecordFormValues } from '../types'
import { DocumentDetailForm } from './DocumentDetailForm'

type DocumentRecordFormProps = {
  formKey: number
  onApprove: (values: DocumentRecordFormValues) => void | Promise<void>
  onApproveAndMarkDone: (
    values: DocumentRecordFormValues
  ) => void | Promise<void>
  isSaving: boolean
}

export function DocumentRecordForm({
  formKey,
  onApprove,
  onApproveAndMarkDone,
  isSaving,
}: DocumentRecordFormProps) {
  const [values, setValues] = useState<DocumentRecordFormValues>(
    defaultRecordFormValues
  )

  useEffect(() => {
    setValues(defaultRecordFormValues)
  }, [formKey])

  async function handleSubmit() {
    await onApprove(values)
  }

  async function handleSecondarySubmit() {
    await onApproveAndMarkDone(values)
  }

  return (
    <div key={formKey} className="space-y-5">
      <DocumentDetailForm
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        onSecondaryClick={handleSecondarySubmit}
      />
    </div>
  )
}
