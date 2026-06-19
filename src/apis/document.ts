import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
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
const RANDOM_CLAIM_CANDIDATE_LIMIT = 10

export async function createDocumentRecord({
  uid_file,
  enteredByUserId = '',
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
    enteredByUserId,
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

export async function getEnteredDocumentsCountByUser(
  userUid: string
): Promise<number> {
  if (!userUid) {
    return 0
  }

  const documentsCollection = collection(db, DOCUMENTS_COLLECTION)
  const documentsQuery = query(
    documentsCollection,
    where('enteredByUserId', '==', userUid)
  )
  const snapshot = await getDocs(documentsQuery)

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

export async function claimRandomUnenteredDocument(
  userUid: string
): Promise<DocumentRecord | null> {
  if (!userUid) {
    return null
  }

  const documentsCollection = collection(db, DOCUMENTS_COLLECTION)
  const documentsQuery = query(
    documentsCollection,
    where('enteredByUserId', '==', ''),
    limit(RANDOM_CLAIM_CANDIDATE_LIMIT)
  )
  const snapshot = await getDocs(documentsQuery)
  const candidateDocs = snapshot.docs.sort(() => Math.random() - 0.5)

  for (const candidateDoc of candidateDocs) {
    const claimedDocument = await runTransaction(db, async (transaction) => {
      const documentRef = doc(db, DOCUMENTS_COLLECTION, candidateDoc.id)
      const latestSnapshot = await transaction.get(documentRef)

      if (!latestSnapshot.exists()) {
        return null
      }

      const latestDocument = latestSnapshot.data() as DocumentRecord

      if (latestDocument.enteredByUserId) {
        return null
      }

      transaction.update(documentRef, {
        enteredByUserId: userUid,
        updated_at: serverTimestamp(),
      })

      return {
        ...latestDocument,
        uid: latestDocument.uid || latestSnapshot.id,
        enteredByUserId: userUid,
      }
    })

    if (claimedDocument) {
      return claimedDocument
    }
  }

  return null
}

function isDocumentCompleted(document: DocumentRecord): boolean {
  return Boolean(
    document.is_completed ||
      document.so_ky_hieu ||
      document.ngay_thang ||
      document.tac_gia ||
      document.trich_yeu ||
      document.so_to
  )
}

export async function getCompletedDocumentCountByUidFile(
  uidFile: string
): Promise<number> {
  const documents = await getDocumentsByUidFile(uidFile)

  return documents.filter(isDocumentCompleted).length
}
