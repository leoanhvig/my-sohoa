import cors from 'cors'
import dotenv from 'dotenv'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: 'server/.env' })

const app = express()
const port = Number(process.env.PORT || 4000)
const uploadsRoot = path.resolve(process.env.UPLOADS_DIR || 'server/uploads')
const pdfUploadsDir = path.join(uploadsRoot, 'pdf')
const maxUploadFileSizeMb = Number(process.env.MAX_UPLOAD_FILE_SIZE_MB || 1024)

fs.mkdirSync(pdfUploadsDir, { recursive: true })

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'document.pdf'
}

function getDisplayFileName(fileName: string): string {
  const mayBeMojibake = /[ÃÂÄÆÐÑ]/.test(fileName)

  if (!mayBeMojibake) {
    return fileName
  }

  const decodedFileName = Buffer.from(fileName, 'latin1').toString('utf8')

  return decodedFileName.includes('�') ? fileName : decodedFileName
}

const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, pdfUploadsDir)
    },
    filename: (_req, file, callback) => {
      const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      callback(
        null,
        `${uniquePrefix}-${sanitizeFileName(
          getDisplayFileName(file.originalname)
        )}`
      )
    },
  }),
  fileFilter: (_req, file, callback) => {
    const originalName = getDisplayFileName(file.originalname)

    if (
      file.mimetype === 'application/pdf' ||
      originalName.toLowerCase().endsWith('.pdf')
    ) {
      callback(null, true)
      return
    }

    callback(new Error('Only PDF files are supported.'))
  },
  limits: {
    fileSize: maxUploadFileSizeMb * 1024 * 1024,
    files: 50,
  },
})

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
app.use('/uploads', express.static(uploadsRoot))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post(
  '/api/local-files/upload-pdfs',
  (req: Request, res: Response, next: NextFunction) => {
    pdfUpload.array('files')(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            message: `File PDF quá lớn. Giới hạn hiện tại là ${maxUploadFileSizeMb}MB mỗi file.`,
          })
        }

        return res.status(400).json({ message: error.message })
      }

      if (error) {
        return res.status(400).json({
          message:
            error instanceof Error ? error.message : 'Không upload được PDF.',
        })
      }

      next()
    })
  },
  async (req: Request, res: Response) => {
    try {
      const uploadedFiles = (req.files || []) as Express.Multer.File[]

      if (uploadedFiles.length === 0) {
        return res.status(400).json({ message: 'Please upload PDF files.' })
      }

      const forwardedProto = req.headers['x-forwarded-proto']
      const protocol = Array.isArray(forwardedProto)
        ? forwardedProto[0]
        : forwardedProto || 'http'
      const host = req.headers.host || `localhost:${port}`
      const files = uploadedFiles.map((file) => {
        const relativePath = path
          .relative(uploadsRoot, file.path)
          .split(path.sep)
          .join('/')
        const downloadUrl = `${protocol}://${host}/uploads/${relativePath}`

        return {
          originalName: getDisplayFileName(file.originalname),
          fileName: file.filename,
          storagePath: relativePath,
          downloadUrl,
          size: file.size,
          mimeType: file.mimetype,
        }
      })

      return res.json({ files })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload PDF files.'
      return res.status(500).json({ message })
    }
  }
)

app.listen(port, () => {
  console.log(`Local PDF API listening on http://localhost:${port}`)
})
