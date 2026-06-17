import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export interface CreateFileRecordParams {
  file_name: string
  number_of_file: number
  creator_uid: string
  updated_uid: string
}

export interface FileRecord extends CreateFileRecordParams {
  uid: string
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}

const FILE_COLLECTION = 'File'

export async function createFileRecord({
  file_name,
  number_of_file,
  creator_uid,
  updated_uid,
}: CreateFileRecordParams): Promise<FileRecord> {
  const fileRef = doc(collection(db, FILE_COLLECTION))
  const timestamp = serverTimestamp()
  const fileRecord: FileRecord = {
    uid: fileRef.id,
    file_name,
    number_of_file,
    creator_uid,
    updated_uid,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await setDoc(fileRef, fileRecord)

  return fileRecord
}

export async function getFileRecordByName(
  fileName: string
): Promise<FileRecord | null> {
  const filesCollection = collection(db, FILE_COLLECTION)
  const filesQuery = query(
    filesCollection,
    where('file_name', '==', fileName),
    limit(1)
  )
  const snapshot = await getDocs(filesQuery)

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].data() as FileRecord
}
