import { getAllHealthFormRecords } from '@/apis/healthForm'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useState } from 'react'
import { formatValue, healthFormColumns } from '../utils'

const healthFormExcelHeaders = healthFormColumns.map((column) => column.title)

export function useExportHealthFormExcel() {
  const { showError, showTypedToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  async function exportAllHealthForms() {
    setIsExporting(true)

    try {
      const [allRecords, XLSX] = await Promise.all([
        getAllHealthFormRecords(),
        import('xlsx'),
      ])

      if (allRecords.length === 0) {
        showError('Không có dữ liệu HealthForm để export.')
        return
      }

      const rows = allRecords.map((record) =>
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
        `healthform-${new Date().toISOString().slice(0, 10)}.xlsx`
      )
      showTypedToast(EToastTypes.SUCCESS, 'Đã export dữ liệu HealthForm')
    } catch (error) {
      showError('Không export được dữ liệu HealthForm. Vui lòng thử lại.')
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportAllHealthForms,
    isExporting,
  }
}
