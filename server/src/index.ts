import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { AuthenticatedRequest, requireFirebaseAuth } from './authMiddleware'
import { syncDriveFolderToFirestore } from './firestoreDriveSync'
import {
  extractDriveFolderId,
  getAuthenticatedDriveClient,
  getDriveFileContentInfo,
  getDriveFolderInfo,
  listSupportedDriveFiles,
} from './googleDrive'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: 'server/.env' })

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    allowedHeaders: ['Authorization', 'Content-Type', 'Range'],
    exposedHeaders: [
      'Accept-Ranges',
      'Content-Disposition',
      'Content-Length',
      'Content-Range',
      'Content-Type',
    ],
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post(
  '/api/drive/sync-folder',
  requireFirebaseAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const folderInput = String(req.body.folderId || req.body.folderUrl || '')
      const folderId = extractDriveFolderId(folderInput)

      if (!folderId) {
        return res
          .status(400)
          .json({ message: 'Google Drive folder ID is required.' })
      }

      if (!req.user?.uid) {
        return res.status(401).json({ message: 'Missing authenticated user.' })
      }

      const folderInfo = await getDriveFolderInfo(folderId)
      const files = await listSupportedDriveFiles(folderId)
      console.log(
        `Drive folder ${folderInfo.name} (${folderId}) has ${files.length} supported files.`
      )
      const result = await syncDriveFolderToFirestore({
        folderId,
        folderName: String(req.body.folderName || folderInfo.name || folderId),
        folderLink: folderInfo.webViewLink,
        files,
        userUid: req.user.uid,
      })

      return res.json(result)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to sync Google Drive folder.'
      return res.status(500).json({ message })
    }
  }
)

app.get(
  '/api/drive/files/:fileId/content',
  requireFirebaseAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const fileId = String(req.params.fileId || '').trim()

      if (!fileId) {
        return res
          .status(400)
          .json({ message: 'Google Drive file ID is required.' })
      }

      const fileInfo = await getDriveFileContentInfo(fileId)

      if (fileInfo.mimeType !== 'application/pdf') {
        return res
          .status(415)
          .json({ message: 'Only PDF files are supported.' })
      }

      const drive = getAuthenticatedDriveClient()
      const range = req.headers.range
      const requestHeaders = range ? { Range: range } : undefined
      const response = await drive.files.get(
        {
          fileId,
          alt: 'media',
          supportsAllDrives: true,
        },
        {
          responseType: 'stream',
          headers: requestHeaders,
        }
      )

      if (range && response.headers['content-range']) {
        res.status(206)
        res.setHeader('Content-Range', response.headers['content-range'])
      }

      res.setHeader('Content-Type', fileInfo.mimeType)
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(fileInfo.name)}"`
      )
      res.setHeader('Accept-Ranges', 'bytes')

      const contentLength = response.headers['content-length'] || fileInfo.size

      if (contentLength) {
        res.setHeader('Content-Length', contentLength)
      }

      response.data.on('error', (error) => {
        console.error('Failed to stream Google Drive file:', error)
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: 'Failed to stream Google Drive file.' })
        } else {
          res.destroy(error)
        }
      })

      response.data.pipe(res)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load Google Drive file content.'
      return res.status(500).json({ message })
    }
  }
)

app.listen(port, () => {
  console.log(`Drive sync API listening on http://localhost:${port}`)
})
