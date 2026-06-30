import { HealthFormRecord } from '@/apis/healthForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog'
import { savedFieldNameByTitle, savedFieldTitles } from '../constants'
import { formatValue } from '../utils'

interface HealthFormRecordDialogProps {
  record: HealthFormRecord | null
  onOpenChange: (open: boolean) => void
  title?: string
  fieldTitles?: string[]
  fieldNameByTitle?: Record<string, string>
}

export function HealthFormRecordDialog({
  record,
  onOpenChange,
  title = 'View HealthForm data',
  fieldTitles = savedFieldTitles,
  fieldNameByTitle = savedFieldNameByTitle,
}: HealthFormRecordDialogProps) {
  if (!record) return null
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl bg-white overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-200  px-6 py-4">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription>Record: {record.uid}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto px-6">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm">
              <tr>
                <th className="w-16 px-4 py-3 text-left font-bold text-slate-600">
                  #
                </th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {fieldTitles.map((fieldTitle, index) => {
                const fieldName = fieldNameByTitle[fieldTitle]
                const value = fieldName ? record[fieldName] : ''

                return (
                  <tr key={fieldTitle}>
                    <td className="px-4 py-3 font-semibold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">
                      {fieldTitle}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatValue(value) || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
