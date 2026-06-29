import {
  collection,
  doc,
  documentId,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export interface CreateFileRecordParams {
  file_name: string
  number_of_file: number
  number_of_file_done?: number
  enteredByUserId?: string
  creator_uid: string
  updated_uid: string
  storage_provider?: 'firebase_storage'
}

export interface FileRecord
  extends Omit<CreateFileRecordParams, 'enteredByUserId'> {
  uid: string
  enteredByUserId: string
  created_at: ReturnType<typeof serverTimestamp>
  updated_at: ReturnType<typeof serverTimestamp>
}

export interface UpdateFileRecordParams {
  uid: string
  file_name: string
  number_of_file: number
  number_of_file_done: number
  creator_uid: string
  updated_uid: string
  storage_provider: 'firebase_storage'
}

export interface DashboardFileRecord extends FileRecord {
  completed_file_count: number
}

const FILE_COLLECTION = 'Files'

export async function createFileRecord({
  file_name,
  number_of_file,
  number_of_file_done = 0,
  enteredByUserId = '',
  creator_uid,
  updated_uid,
  storage_provider = 'firebase_storage',
}: CreateFileRecordParams): Promise<FileRecord> {
  const fileRef = doc(collection(db, FILE_COLLECTION))
  const timestamp = serverTimestamp()
  const fileRecord: FileRecord = {
    uid: fileRef.id,
    file_name,
    number_of_file,
    number_of_file_done,
    enteredByUserId,
    creator_uid,
    updated_uid,
    storage_provider,
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

export async function getAllFileRecords(): Promise<FileRecord[]> {
  const snapshot = await getDocs(collection(db, FILE_COLLECTION))

  return snapshot.docs.map((file) => file.data() as FileRecord)
}

export async function getAssignableFilesByUser(
  userUid: string
): Promise<FileRecord[]> {
  const filesCollection = collection(db, FILE_COLLECTION)
  const [unassignedSnapshot, assignedSnapshot] = await Promise.all([
    getDocs(query(filesCollection, where('enteredByUserId', '==', ''))),
    getDocs(query(filesCollection, where('enteredByUserId', '==', userUid))),
  ])

  return [...unassignedSnapshot.docs, ...assignedSnapshot.docs].map(
    (file) => file.data() as FileRecord
  )
}

export async function getFilesWithoutUpdatedUid(): Promise<FileRecord[]> {
  const filesCollection = collection(db, FILE_COLLECTION)
  const snapshot = await getDocs(filesCollection)

  return snapshot.docs
    .map((file) => file.data() as FileRecord)
    .filter((file) => !file.enteredByUserId)
}

export async function getDashboardFilesByUser(
  userUid: string
): Promise<FileRecord[]> {
  const [assignedFiles, unassignedFiles] = await Promise.all([
    getAssignableFilesByUser(userUid),
    getFilesWithoutUpdatedUid(),
  ])
  const filesByUid = new Map<string, FileRecord>()

  for (const file of [...assignedFiles, ...unassignedFiles]) {
    filesByUid.set(file.uid, file)
  }

  return Array.from(filesByUid.values())
}

export async function getUnassignedFilesCount(): Promise<number> {
  const unassignedFiles = await getFilesWithoutUpdatedUid()

  return unassignedFiles.length
}

export async function getDoneFilesCountByUser(
  userUid: string
): Promise<number> {
  if (!userUid) {
    return 0
  }

  const filesCollection = collection(db, FILE_COLLECTION)
  const snapshot = await getDocs(
    query(filesCollection, where('enteredByUserId', '==', userUid))
  )

  return snapshot.docs.reduce((total, file) => {
    const fileRecord = file.data() as FileRecord

    return total + (fileRecord.number_of_file_done || 0)
  }, 0)
}

export async function getUncompletedFilesCountByUser(
  userUid: string
): Promise<number> {
  if (!userUid) {
    return 0
  }

  const filesCollection = collection(db, FILE_COLLECTION)
  const snapshot = await getDocs(
    query(filesCollection, where('enteredByUserId', '==', userUid))
  )

  return snapshot.docs.reduce((total, file) => {
    const fileRecord = file.data() as FileRecord
    const totalPages = fileRecord.number_of_file || 0
    const donePages = fileRecord.number_of_file_done || 0

    return totalPages === 0 || donePages < totalPages ? total + 1 : total
  }, 0)
}

export async function claimFileRecord({
  fileUid,
  userUid,
}: {
  fileUid: string
  userUid: string
}): Promise<void> {
  const fileRef = doc(db, FILE_COLLECTION, fileUid)

  await updateDoc(fileRef, {
    enteredByUserId: userUid,
    updated_uid: userUid,
    updated_at: serverTimestamp(),
  })
}

export async function updateFileRecordInfo({
  uid,
  file_name,
  number_of_file,
  number_of_file_done,
  creator_uid,
  updated_uid,
  storage_provider,
}: UpdateFileRecordParams): Promise<void> {
  const fileRef = doc(db, FILE_COLLECTION, uid)

  await updateDoc(fileRef, {
    file_name,
    number_of_file,
    number_of_file_done,
    creator_uid,
    updated_uid,
    storage_provider,
    updated_at: serverTimestamp(),
  })
}

export async function getFileRecordsByIds(
  fileUids: string[]
): Promise<FileRecord[]> {
  if (fileUids.length === 0) {
    return []
  }

  const uniqueFileUids = Array.from(new Set(fileUids))
  const chunks: string[][] = []

  for (let index = 0; index < uniqueFileUids.length; index += 10) {
    chunks.push(uniqueFileUids.slice(index, index + 10))
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      getDocs(
        query(collection(db, FILE_COLLECTION), where(documentId(), 'in', chunk))
      )
    )
  )

  return snapshots.flatMap((snapshot) =>
    snapshot.docs.map((file) => file.data() as FileRecord)
  )
}
