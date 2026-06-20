import { getHealthFormRecordsByCreatorAndExamInfo } from '@/apis/healthForm'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useState } from 'react'
import { formatValue, healthFormColumns } from '../utils'

const healthFormExcelHeaders = healthFormColumns.map((column) => column.title)

type ExportHealthFormFilters = {
  creator: string
  clinicLocation: string
  examDate: string
}

type TimestampLike = {
  toDate: () => Date
}

function hasToDate(value: unknown): value is TimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  )
}

function getCreatedAtTime(value: unknown): number {
  if (hasToDate(value)) return value.toDate().getTime()
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return new Date(value).getTime()

  return 0
}

export function useExportHealthFormExcel() {
  const { showError, showTypedToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  async function exportHealthFormsByFilters({
    creator,
    clinicLocation,
    examDate,
  }: ExportHealthFormFilters) {
    if (!creator) {
      showError('Bạn cần đăng nhập trước khi export.')
      return
    }

    if (!clinicLocation || !examDate) {
      showError('Vui lòng chọn địa điểm khám và ngày khám để export.')
      return
    }

    setIsExporting(true)

    try {
      const [records, XLSX] = await Promise.all([
        getHealthFormRecordsByCreatorAndExamInfo({
          creator,
          clinicLocation,
          examDate,
        }),
        import('xlsx'),
      ])

      if (records.length === 0) {
        showError('Không có dữ liệu HealthForm theo địa điểm và ngày đã chọn.')
        return
      }

      const sortedRecords = [...records].sort(
        (recordA, recordB) =>
          getCreatedAtTime(recordA.created_at) -
          getCreatedAtTime(recordB.created_at)
      )

      const rows = sortedRecords.map((record) =>
        healthFormColumns.map((column) => formatValue(record[column.field]))
      )
      const worksheet = XLSX.utils.aoa_to_sheet([
        healthFormExcelHeaders,
        ...rows,
      ])
      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(workbook, worksheet, 'HealthForm')
      XLSX.writeFile(
        workbook,
        `healthform-${clinicLocation}-${examDate}.xlsx`.replace(
          /[\\/:*?"<>|]/g,
          '-'
        )
      )
      showTypedToast(EToastTypes.SUCCESS, 'Đã export dữ liệu HealthForm')
    } catch (error) {
      showError('Không export được dữ liệu HealthForm. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportHealthFormsByFilters,
    isExporting,
  }
}
