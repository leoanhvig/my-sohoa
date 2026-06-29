import { serverTimestamp } from 'firebase/firestore'

export interface CreateDocumentRecordParams {
  uid_file: string
  enteredByUserId?: string
  co_quan_ban_hanh?: string
  ngay_thang?: string
  so_ky_hieu?: string
  so_to?: string
  trich_yeu?: string
}

export interface DocumentRecord {
  uid: string
  uid_file: string
  enteredByUserId: string
  co_quan_ban_hanh: string
  ngay_thang: string
  so_ky_hieu: string
  so_to: string
  trich_yeu: string
  is_completed?: boolean
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}
