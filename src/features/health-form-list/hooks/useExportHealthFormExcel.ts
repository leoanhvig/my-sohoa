import { getAllHealthFormRecords } from '@/apis/healthForm'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { formatValue, getRecordColumns } from '../utils'

export function useExportHealthFormExcel() {
  const { showError, showTypedToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  async function exportAllHealthForms() {
    setIsExporting(true)

    try {
      const allRecords = await getAllHealthFormRecords()

      if (allRecords.length === 0) {
        showError('Không có dữ liệu HealthForm để export.')
        return
      }

      const columns = getRecordColumns(allRecords)
      const rows = allRecords.map((record) =>
        columns.reduce<Record<string, string>>((result, column) => {
          result[column] = formatValue(record[column])
          return result
        }, {})
      )
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: columns })
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
