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
  drive_file_id?: string
  drive_folder_id?: string
  drive_mime_type?: string
  drive_size?: string
  drive_web_view_link?: string
  drive_download_link?: string
  storage_provider?: 'firebase_storage' | 'google_drive'
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
  drive_file_id: string
  drive_folder_id: string
  drive_mime_type: string
  drive_size: string
  drive_web_view_link: string
  drive_download_link: string
  storage_provider: 'firebase_storage' | 'google_drive'
  is_completed?: boolean
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}
