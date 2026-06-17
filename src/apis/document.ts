import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export interface CreateDocumentRecordParams {
  uid_file: string
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
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}

const DOCUMENTS_COLLECTION = 'Documents'

export async function createDocumentRecord({
  uid_file,
  so_ky_hieu = '',
  ngay_thang = '',
  tac_gia = '',
  trich_yeu = '',
  so_to = 0,
  file_name,
  relative_path = '',
  storage_path = '',
  download_url = '',
  drive_file_id = '',
  drive_folder_id = '',
  drive_mime_type = '',
  drive_size = '',
  drive_web_view_link = '',
  drive_download_link = '',
  storage_provider = 'firebase_storage',
}: CreateDocumentRecordParams): Promise<DocumentRecord> {
  const documentRef = doc(collection(db, DOCUMENTS_COLLECTION))
  const timestamp = serverTimestamp()
  const documentRecord: DocumentRecord = {
    uid: documentRef.id,
    uid_file,
    so_ky_hieu,
    ngay_thang,
    tac_gia,
    trich_yeu,
    so_to,
    file_name,
    relative_path,
    storage_path,
    download_url,
    drive_file_id,
    drive_folder_id,
    drive_mime_type,
    drive_size,
    drive_web_view_link,
    drive_download_link,
    storage_provider,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await setDoc(documentRef, documentRecord)

  return documentRecord
}

export async function getDocumentsByUidFile(
  uidFile: string
): Promise<DocumentRecord[]> {
  const documentsCollection = collection(db, DOCUMENTS_COLLECTION)
  const documentsQuery = query(
    documentsCollection,
    where('uid_file', '==', uidFile)
  )
  const snapshot = await getDocs(documentsQuery)

  return snapshot.docs.map((document) => document.data() as DocumentRecord)
}
