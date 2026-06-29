import { serverTimestamp } from 'firebase/firestore'

export interface CreateDocumentRecordParams {
  uid_file: string
  enteredByUserId?: string
  so_ky_hieu?: string
  ngay_thang?: string
  tac_gia?: string
  trich_yeu?: string
  so_to?: number
  file_name: string
  relative_path?: string
  storage_path?: string
  download_url?: string
  storage_provider?: 'firebase_storage'
}

export interface DocumentRecord {
  uid: string
  uid_file: string
  enteredByUserId: string
  so_ky_hieu: string
  ngay_thang: string
  tac_gia: string
  trich_yeu: string
  so_to: number
  file_name: string
  relative_path: string
  storage_path: string
  download_url: string
  storage_provider: 'firebase_storage'
  is_completed?: boolean
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}
