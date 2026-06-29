import {
  collection,
  doc,
  getDoc,
  getDocs,
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
