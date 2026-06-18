import { getAllHealthFormRecords } from '@/apis/healthForm'
import { EToastTypes, useToast } from '@/contexts/ToastContext'
import { useState } from 'react'
import { formatValue } from '../utils'

const healthFormExcelColumns = [
  { title: 'STT/Mã bệnh nhân', field: 'patientCode' },
  { title: 'Địa điểm khám', field: 'clinicLocation' },
  { title: 'Ngày khám', field: 'examDate' },
  { title: 'Họ và Tên', field: 'fullName' },
  { title: 'Năm sinh', field: 'birthYear' },
  { title: 'Tuổi', field: 'age' },
  { title: 'Số điện thoại', field: 'phoneNumber' },
  { title: 'Chiều cao', field: 'height' },
  { title: 'Cân nặng', field: 'weight' },
  { title: 'Dân tộc', field: 'ethnicity' },
  { title: 'Phường/xã', field: 'ward' },
  { title: 'Tỉnh/TP', field: 'province' },
  { title: 'Đơn vị công tác', field: 'workplace' },
  { title: 'Chi tiết', field: 'details' },
  { title: 'Trình độ', field: 'education' },
  { title: 'PARA', field: 'para' },
  { title: 'Tuổi QHTD đầu tiên', field: 'firstSexAge' },
  { title: 'Đời sống tình cảm', field: 'relationshipStatus' },
  { title: 'Biện pháp tránh thai', field: 'contraception' },
  { title: 'Tiêm vắc xin HPV?', field: 'hpvVaccinated' },
  { title: 'Loại vắc xin đã tiêm', field: 'hpvVaccineType' },
  { title: 'Số mũi', field: 'hpvDoseCount' },
  { title: 'Đã tầm soát UTCTC?', field: 'cervicalCancerScreened' },
  { title: 'Phương pháp đã làm', field: 'screeningMethod' },
  { title: 'Kết quả', field: 'screeningResult' },
  { title: 'Năm tầm soát', field: 'screeningYear' },
  { title: 'Bệnh phụ khoa', field: 'gynecologicalDisease' },
  { title: 'Bệnh nền', field: 'underlyingDisease' },
  { title: 'Hút thuốc lá', field: 'smoking' },
  { title: 'Bia rượu', field: 'alcohol' },
  { title: 'Tình trạng HIV', field: 'hivStatus' },
  { title: 'Thuốc ức chế MD', field: 'immunosuppressant' },
  { title: 'Tập thể dục', field: 'exercise' },
  { title: 'Bơi lội', field: 'swimming' },
  { title: 'GĐ mắc UT CTC?', field: 'familyCervicalCancer' },
  { title: 'Triệu chứng hiện tại', field: 'currentSymptoms' },
  { title: 'Kết quả AI', field: 'aiResult' },
  { title: 'Nhận xét của Bác Sĩ', field: 'doctorComment' },
  { title: 'Hướng xử trí', field: 'treatmentPlan' },
]

const healthFormExcelHeaders = healthFormExcelColumns.map(
  (column) => column.title
)

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
        healthFormExcelColumns.map((column) =>
          formatValue(record[column.field])
        )
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
