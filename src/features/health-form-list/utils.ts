import { HealthFormRecord } from '@/apis/healthForm'

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().toLocaleString('vi-VN')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

export function getRecordColumns(records: HealthFormRecord[]) {
  const priorityColumns = ['uid', 'creator', 'created_at', 'updated_at']
  const columns = new Set<string>()

  records.forEach((record) => {
    Object.keys(record).forEach((key) => columns.add(key))
  })

  return [
    ...priorityColumns.filter((column) => columns.has(column)),
    ...Array.from(columns)
      .filter((column) => !priorityColumns.includes(column))
      .sort(),
  ]
}
