import { HealthFormRecord } from '@/apis/healthForm'

export type HealthFormColumn = {
  title: string
  field: string
}

export const healthFormColumns: HealthFormColumn[] = [
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

type FirestoreTimestampLike = {
  toDate: () => Date
}

function hasToDate(value: unknown): value is FirestoreTimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  )
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (hasToDate(value)) {
    return value.toDate().toLocaleString('vi-VN')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

export function getRecordColumns(_records: HealthFormRecord[]) {
  return healthFormColumns
}
