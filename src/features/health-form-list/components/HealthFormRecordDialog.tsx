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
}

export function HealthFormRecordDialog({
  record,
  onOpenChange,
}: HealthFormRecordDialogProps) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0 sm:max-w-4xl">
        {record && (
          <>
            <DialogHeader className="border-b border-slate-200 px-6 py-4">
              <DialogTitle className="text-xl font-bold text-slate-900">
                View HealthForm data
              </DialogTitle>
              <DialogDescription>Record: {record.uid}</DialogDescription>
            </DialogHeader>

            <div className="max-h-[70vh] overflow-auto p-6">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
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
                  {savedFieldTitles.map((title, index) => {
                    const fieldName = savedFieldNameByTitle[title]
                    const value = fieldName ? record[fieldName] : ''

                    return (
                      <tr key={title}>
                        <td className="px-4 py-3 font-semibold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {title}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
