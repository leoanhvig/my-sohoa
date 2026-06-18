import { HealthFormRecord } from '@/apis/healthForm'

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
