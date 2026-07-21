import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import type {
  CreateDocumentRecordParams,
  DocumentRecord,
} from '../interfaces/document'

export type {
  CreateDocumentRecordParams,
  DocumentRecord,
} from '../interfaces/document'

const DOCUMENTS_COLLECTION = 'Documents'
const HO_TICH_DOCUMENTS_COLLECTION = 'DocumentsHoTich'

export type HoTichDocumentType = 'marriage' | 'birth' | 'death' | 'adoption'

export type HoTichDocumentRecord = {
  uid: string
  uid_file: string
  file_name: string
  enteredByUserId: string
  entered_by_uid: string
  type: HoTichDocumentType
  document_number: string
  registered_date: string
  page_number: string
  person_a: string
  person_b: string
  child_name: string
  birth_date: string
  deceased_name: string
  death_date: string
  adopter_name: string
  adopted_name: string
  title: string
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}

export type SaveHoTichDocumentParams = Omit<
  HoTichDocumentRecord,
  'uid' | 'created_at' | 'updated_at'
>

export type UpdateDocumentRecordParams = {
  uid: string
  co_quan_ban_hanh: string
  ngay_thang: string
  so_ky_hieu: string
  so_to: string
  trich_yeu: string
}

export async function markDocumentAsDone(documentUid: string): Promise<void> {
  const documentRef = doc(db, DOCUMENTS_COLLECTION, documentUid)

  await updateDoc(documentRef, {
    is_completed: true,
    updated_at: serverTimestamp(),
  })
}

export async function createDocumentRecord({
  uid_file,
  enteredByUserId = '',
  co_quan_ban_hanh = '',
  ngay_thang = '',
  so_ky_hieu = '',
  so_to = '',
  trich_yeu = '',
}: CreateDocumentRecordParams): Promise<DocumentRecord> {
  const documentRef = doc(collection(db, DOCUMENTS_COLLECTION))
  const timestamp = serverTimestamp()
  const documentRecord: DocumentRecord = {
    uid: documentRef.id,
    uid_file,
    enteredByUserId,
    co_quan_ban_hanh,
    ngay_thang,
    so_ky_hieu,
    so_to,
    trich_yeu,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await setDoc(documentRef, documentRecord)

  return documentRecord
}

export async function updateDocumentRecord({
  uid,
  co_quan_ban_hanh,
  ngay_thang,
  so_ky_hieu,
  so_to,
  trich_yeu,
}: UpdateDocumentRecordParams): Promise<void> {
  const documentRef = doc(db, DOCUMENTS_COLLECTION, uid)

  await updateDoc(documentRef, {
    co_quan_ban_hanh,
    ngay_thang,
    so_ky_hieu,
    so_to,
    trich_yeu,
    updated_at: serverTimestamp(),
  })
}

export async function deleteDocumentRecord(documentUid: string): Promise<void> {
  const documentRef = doc(db, DOCUMENTS_COLLECTION, documentUid)

  await deleteDoc(documentRef)
}

export async function getDocumentsByUidFile(
  uidFile: string
): Promise<DocumentRecord[]> {
  const documentsCollection = collection(db, DOCUMENTS_COLLECTION)
  const documentsQuery = query(
    documentsCollection,
    where('uid_file', '==', uidFile),
    orderBy('created_at', 'asc')
  )
  const snapshot = await getDocs(documentsQuery)

  return snapshot.docs.map((document) => document.data() as DocumentRecord)
}

export async function getDocumentByUid(
  documentUid: string
): Promise<DocumentRecord | null> {
  if (!documentUid) {
    return null
  }

  const documentRef = doc(db, DOCUMENTS_COLLECTION, documentUid)
  const snapshot = await getDoc(documentRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as DocumentRecord
}

export async function getUnenteredDocuments(): Promise<DocumentRecord[]> {
  const documentsCollection = collection(db, DOCUMENTS_COLLECTION)
  const documentsQuery = query(
    documentsCollection,
    where('enteredByUserId', '==', '')
  )
  const snapshot = await getDocs(documentsQuery)

  return snapshot.docs.map((document) => document.data() as DocumentRecord)
}

export async function getDocumentsByEnteredUser(
  userUid: string
): Promise<DocumentRecord[]> {
  if (!userUid) {
    return []
  }

  const documentsCollection = collection(db, DOCUMENTS_COLLECTION)
  const documentsQuery = query(
    documentsCollection,
    where('enteredByUserId', '==', userUid)
  )
  const snapshot = await getDocs(documentsQuery)

  return snapshot.docs.map((document) => document.data() as DocumentRecord)
}

export async function getUnenteredDocumentsCount(): Promise<number> {
  const documents = await getUnenteredDocuments()

  return documents.length
}

export async function getDocumentsCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, DOCUMENTS_COLLECTION))

  return snapshot.size
}

export async function claimDocumentRecord({
  documentUid,
  userUid,
}: {
  documentUid: string
  userUid: string
}): Promise<void> {
  const documentRef = doc(db, DOCUMENTS_COLLECTION, documentUid)

  await updateDoc(documentRef, {
    enteredByUserId: userUid,
    updated_at: serverTimestamp(),
  })
}

export async function createHoTichDocumentRecord(
  params: SaveHoTichDocumentParams
): Promise<HoTichDocumentRecord> {
  const documentRef = doc(collection(db, HO_TICH_DOCUMENTS_COLLECTION))
  const timestamp = serverTimestamp()
  const documentRecord: HoTichDocumentRecord = {
    ...params,
    uid: documentRef.id,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await setDoc(documentRef, documentRecord)

  return documentRecord
}

export async function updateHoTichDocumentRecord(
  documentUid: string,
  params: SaveHoTichDocumentParams
): Promise<void> {
  const documentRef = doc(db, HO_TICH_DOCUMENTS_COLLECTION, documentUid)
  await updateDoc(documentRef, {
    ...params,
    updated_at: serverTimestamp(),
  })
}

export async function deleteHoTichDocumentRecord(
  documentUid: string
): Promise<void> {
  await deleteDoc(doc(db, HO_TICH_DOCUMENTS_COLLECTION, documentUid))
}

export async function getHoTichDocumentsByUidFile(
  uidFile: string
): Promise<HoTichDocumentRecord[]> {
  const documentsQuery = query(
    collection(db, HO_TICH_DOCUMENTS_COLLECTION),
    where('uid_file', '==', uidFile),
    orderBy('created_at', 'asc')
  )
  const snapshot = await getDocs(documentsQuery)

  return snapshot.docs.map(
    (document) => document.data() as HoTichDocumentRecord
  )
}
