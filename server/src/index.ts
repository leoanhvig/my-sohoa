import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { AuthenticatedRequest, requireFirebaseAuth } from './authMiddleware'
import { syncDriveFolderToFirestore } from './firestoreDriveSync'
import {
  extractDriveFolderId,
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

app.listen(port, () => {
  console.log(`Drive sync API listening on http://localhost:${port}`)
})
