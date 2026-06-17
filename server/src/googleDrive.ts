import dotenv from 'dotenv'
import { google } from 'googleapis'

dotenv.config({ path: 'server/.env' })
dotenv.config({ path: '.env.local' })

export interface DriveFileItem {
  id: string
  name: string
  mimeType: string
  size: string
  webViewLink: string
  webContentLink: string
  createdTime: string
  modifiedTime: string
  relativePath: string
}

export interface DriveFolderInfo {
  id: string
  name: string
  webViewLink: string
}

function getPrivateKey(value?: string): string | undefined {
  return value?.replace(/\\n/g, '\n')
}

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = getPrivateKey(process.env.GOOGLE_PRIVATE_KEY)

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing Google Drive credentials. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.'
    )
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  return google.drive({ version: 'v3', auth })
}

export function extractDriveFolderId(input: string): string {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return ''
  }

  const folderMatch = trimmedInput.match(/\/folders\/([a-zA-Z0-9_-]+)/)

  if (folderMatch?.[1]) {
    return folderMatch[1]
  }

  return trimmedInput.split('?')[0]
}

function isSupportedDriveFile(mimeType = '', name = ''): boolean {
  return (
    mimeType === 'application/pdf' ||
    mimeType.startsWith('image/') ||
    name.toLowerCase().endsWith('.pdf')
  )
}

function isDriveFolder(mimeType = ''): boolean {
  return mimeType === 'application/vnd.google-apps.folder'
}

export async function getDriveFolderInfo(
  folderId: string
): Promise<DriveFolderInfo> {
  const drive = getDriveClient()
  const response = await drive.files.get({
    fileId: folderId,
    fields: 'id,name,webViewLink',
    supportsAllDrives: true,
  })

  return {
    id: response.data.id || folderId,
    name: response.data.name || folderId,
    webViewLink: response.data.webViewLink || '',
  }
}

export async function listSupportedDriveFiles(
  folderId: string,
  parentPath = ''
): Promise<DriveFileItem[]> {
  const drive = getDriveClient()
  const files: DriveFileItem[] = []
  let pageToken: string | undefined

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields:
        'nextPageToken, files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime)',
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    for (const file of response.data.files || []) {
      const id = file.id || ''
      const name = file.name || ''
      const mimeType = file.mimeType || ''
      const relativePath = parentPath ? `${parentPath}/${name}` : name

      if (!id) {
        continue
      }

      if (isDriveFolder(mimeType)) {
        const childFiles = await listSupportedDriveFiles(id, relativePath)
        files.push(...childFiles)
        continue
      }

      if (!isSupportedDriveFile(mimeType, name)) {
        continue
      }

      files.push({
        id,
        name,
        mimeType,
        size: file.size || '0',
        webViewLink: file.webViewLink || '',
        webContentLink: file.webContentLink || '',
        createdTime: file.createdTime || '',
        modifiedTime: file.modifiedTime || '',
        relativePath,
      })
    }

    pageToken = response.data.nextPageToken || undefined
  } while (pageToken)

  return files
}
