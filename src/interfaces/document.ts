import { serverTimestamp } from 'firebase/firestore'

export interface CreateDocumentRecordParams {
  uid_file: string
  enteredByUserId?: string
}

export interface DocumentRecord {
  uid: string
  uid_file: string
  enteredByUserId: string
  is_completed?: boolean
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}
