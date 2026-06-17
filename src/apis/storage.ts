import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

export interface UploadPdfFileParams {
  uidFile: string
  file: File
}

export interface UploadedPdfFile {
  storagePath: string
  downloadUrl: string
}

export async function uploadPdfFile({
  uidFile,
  file,
}: UploadPdfFileParams): Promise<UploadedPdfFile> {
  const safeFileName = file.name.replace(/[/\\?%*:|"<>]/g, '-')
  const storagePath = `files/${uidFile}/${safeFileName}`
  const storageRef = ref(storage, storagePath)

  await uploadBytes(storageRef, file, {
    contentType: file.type || 'application/pdf',
  })

  const downloadUrl = await getDownloadURL(storageRef)

  return {
    storagePath,
    downloadUrl,
  }
}
