import { adminDb, serverTimestamp } from './firebaseAdmin'
import { DriveFileItem } from './googleDrive'

interface FileRecord {
  uid: string
  file_name: string
  number_of_file: number
  number_of_file_done: number
  creator_uid: string
  updated_uid: string
  drive_folder_id: string
  drive_folder_link: string
  storage_provider: 'google_drive'
}

interface SyncDriveFolderParams {
  folderId: string
  folderName: string
  folderLink: string
  files: DriveFileItem[]
  userUid: string
}

export interface SyncDriveFolderResult {
  fileRecordUid: string
  folderName: string
  driveFolderId: string
  totalFiles: number
  createdDocuments: number
  skippedDocuments: number
}

async function getFileRecordByDriveFolderId(
  folderId: string
): Promise<FileRecord | null> {
  const snapshot = await adminDb
    .collection('File')
    .where('drive_folder_id', '==', folderId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].data() as FileRecord
}

async function createFileRecord({
  folderId,
  folderName,
  folderLink,
  totalFiles,
  userUid,
}: {
  folderId: string
  folderName: string
  folderLink: string
  totalFiles: number
  userUid: string
}): Promise<FileRecord> {
  const fileRef = adminDb.collection('File').doc()
  const fileRecord: FileRecord = {
    uid: fileRef.id,
    file_name: folderName,
    number_of_file: totalFiles,
    number_of_file_done: 0,
    creator_uid: userUid,
    updated_uid: userUid,
    drive_folder_id: folderId,
    drive_folder_link: folderLink,
    storage_provider: 'google_drive',
  }

  await fileRef.set({
    ...fileRecord,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  return fileRecord
}

async function updateFileRecordCount({
  fileRecordUid,
  totalFiles,
  userUid,
}: {
  fileRecordUid: string
  totalFiles: number
  userUid: string
}) {
  await adminDb.collection('File').doc(fileRecordUid).set(
    {
      number_of_file: totalFiles,
      updated_uid: userUid,
      updated_at: serverTimestamp(),
    },
    { merge: true }
  )
}

async function getExistingDriveFileIds(uidFile: string): Promise<Set<string>> {
  const snapshot = await adminDb
    .collection('Documents')
    .where('uid_file', '==', uidFile)
    .get()

  return new Set(
    snapshot.docs
      .map(
        (documentSnapshot) =>
          documentSnapshot.data().drive_file_id as string | undefined
      )
      .filter(Boolean) as string[]
  )
}

async function createDocumentFromDriveFile({
  uidFile,
  folderId,
  folderName,
  file,
}: {
  uidFile: string
  folderId: string
  folderName: string
  file: DriveFileItem
}) {
  const documentRef = adminDb.collection('Documents').doc()
  const relativePath = `${folderName}/${file.relativePath || file.name}`

  await documentRef.set({
    uid: documentRef.id,
    uid_file: uidFile,
    so_ky_hieu: '',
    ngay_thang: '',
    tac_gia: '',
    trich_yeu: '',
    so_to: 0,
    file_name: file.name,
    relative_path: relativePath,
    storage_path: file.id,
    download_url: file.webViewLink,
    drive_file_id: file.id,
    drive_folder_id: folderId,
    drive_mime_type: file.mimeType,
    drive_size: file.size,
    drive_web_view_link: file.webViewLink,
    drive_download_link: file.webContentLink,
    drive_created_time: file.createdTime,
    drive_modified_time: file.modifiedTime,
    storage_provider: 'google_drive',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

export async function syncDriveFolderToFirestore({
  folderId,
  folderName,
  folderLink,
  files,
  userUid,
}: SyncDriveFolderParams): Promise<SyncDriveFolderResult> {
  let fileRecord = await getFileRecordByDriveFolderId(folderId)

  if (!fileRecord) {
    fileRecord = await createFileRecord({
      folderId,
      folderName,
      folderLink,
      totalFiles: files.length,
      userUid,
    })
  } else {
    await updateFileRecordCount({
      fileRecordUid: fileRecord.uid,
      totalFiles: files.length,
      userUid,
    })
  }

  const existingDriveFileIds = await getExistingDriveFileIds(fileRecord.uid)
  const pendingFiles = files.filter(
    (file) => !existingDriveFileIds.has(file.id)
  )

  for (const file of pendingFiles) {
    await createDocumentFromDriveFile({
      uidFile: fileRecord.uid,
      folderId,
      folderName,
      file,
    })
  }

  return {
    fileRecordUid: fileRecord.uid,
    folderName,
    driveFolderId: folderId,
    totalFiles: files.length,
    createdDocuments: pendingFiles.length,
    skippedDocuments: files.length - pendingFiles.length,
  }
}
