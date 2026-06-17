import { FileText, FolderOpen, Loader2, UploadCloud } from 'lucide-react'
import { ChangeEvent, useMemo, useState } from 'react'
import { createDocumentRecord, getDocumentsByUidFile } from '../apis/document'
import { createFileRecord, getFileRecordByName } from '../apis/file'
import { uploadPdfFile } from '../apis/storage'
import { useUserStore } from '../stores/userStore'
import { Button } from './ui/button'

interface FolderInputElement extends HTMLInputElement {
  webkitdirectory: boolean
  directory: boolean
}

interface UploadFile extends File {
  webkitRelativePath: string
}

export default function UploadFile() {
  const authUser = useUserStore((state) => state.authUser)
  const [folderName, setFolderName] = useState('')
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [skippedCount, setSkippedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  const uploadProgress = useMemo(() => {
    if (!pendingCount) return 0
    return Math.round((uploadedCount / pendingCount) * 100)
  }, [pendingCount, uploadedCount])

  function handleFolderSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []) as UploadFile[]
    const selectedUploadFiles = files.filter(
      (file) =>
        file.name.toLowerCase().endsWith('.pdf') ||
        file.type.startsWith('image/')
    )
    const selectedFolderName =
      selectedUploadFiles[0]?.webkitRelativePath?.split('/')[0] || ''

    setError('')
    setSuccess('')
    setUploadedCount(0)
    setSkippedCount(0)
    setPendingCount(0)
    setFolderName(selectedFolderName)
    setUploadFiles(selectedUploadFiles)
  }

  async function handleUpload() {
    if (!authUser?.uid) {
      setError('You must be logged in to upload files.')
      return
    }

    if (!folderName || uploadFiles.length === 0) {
      setError('Please select a folder containing PDF or image files.')
      return
    }

    try {
      setError('')
      setSuccess('')
      setUploading(true)
      setUploadedCount(0)
      setSkippedCount(0)
      setPendingCount(0)

      let fileRecord = await getFileRecordByName(folderName)
      const isResumingUpload = !!fileRecord

      if (!fileRecord) {
        fileRecord = await createFileRecord({
          file_name: folderName,
          number_of_file: uploadFiles.length,
          creator_uid: authUser.uid,
          updated_uid: authUser.uid,
        })
      }

      const existingDocuments = await getDocumentsByUidFile(fileRecord.uid)
      const uploadedRelativePaths = new Set(
        existingDocuments
          .map((document) => document.relative_path)
          .filter(Boolean)
      )
      const uploadedFileNames = new Set(
        existingDocuments.map((document) => document.file_name)
      )
      const pendingFiles = uploadFiles.filter((uploadFile) => {
        const relativePath = uploadFile.webkitRelativePath || uploadFile.name

        if (uploadedRelativePaths.size > 0) {
          return !uploadedRelativePaths.has(relativePath)
        }

        return !uploadedFileNames.has(uploadFile.name)
      })

      setSkippedCount(uploadFiles.length - pendingFiles.length)
      setPendingCount(pendingFiles.length)

      if (pendingFiles.length === 0) {
        setSuccess(
          `Folder ${folderName} already uploaded. Skipped ${uploadFiles.length} existing files.`
        )
        return
      }

      for (const uploadFile of pendingFiles) {
        const relativePath = uploadFile.webkitRelativePath || uploadFile.name
        const uploadedFile = await uploadPdfFile({
          uidFile: fileRecord.uid,
          file: uploadFile,
        })

        await createDocumentRecord({
          uid_file: fileRecord.uid,
          so_ky_hieu: '',
          ngay_thang: '',
          tac_gia: '',
          trich_yeu: '',
          so_to: 0,
          file_name: uploadFile.name,
          relative_path: relativePath,
          storage_path: uploadedFile.storagePath,
          download_url: uploadedFile.downloadUrl,
        })

        setUploadedCount((count) => count + 1)
      }

      setSuccess(
        isResumingUpload
          ? `Resume completed. Uploaded ${
              pendingFiles.length
            } missing files and skipped ${
              uploadFiles.length - pendingFiles.length
            } existing files from folder ${folderName}.`
          : `Uploaded ${pendingFiles.length} files from folder ${folderName}.`
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload files.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Upload folder PDF
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Chọn một folder, hệ thống sẽ đếm PDF/image, tạo record File,
                upload Storage và tạo Documents.
              </p>
            </div>
            <FolderOpen className="h-10 w-10 text-indigo-600" />
          </div>

          <div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
            <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">
              Chọn folder PDF/Image
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                className="sr-only"
                ref={(input) => {
                  if (!input) return
                  ;(input as FolderInputElement).webkitdirectory = true
                  ;(input as FolderInputElement).directory = true
                }}
                onChange={handleFolderSelect}
              />
            </label>
            <p className="mt-3 text-xs text-slate-500">
              Chỉ các file PDF hoặc image sẽ được upload.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Thông tin folder
              </h2>
              <p className="text-sm text-slate-500">
                Folder:{' '}
                <span className="font-semibold text-slate-900">
                  {folderName || 'Chưa chọn'}
                </span>
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              {uploadFiles.length} files
            </div>
          </div>

          <div className="p-6">
            {uploadFiles.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
                  {uploadFiles.map((file) => (
                    <div
                      key={file.webkitRelativePath || file.name}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-red-500" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {file.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {file.webkitRelativePath}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>

                {uploading && (
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
                      <span>
                        Uploaded {uploadedCount}/
                        {pendingCount || uploadFiles.length}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {skippedCount > 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    Skipped {skippedCount} already uploaded files.
                  </div>
                )}

                <Button
                  type="button"
                  disabled={uploading}
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={handleUpload}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" /> Upload folder
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
                Chưa có file PDF/image nào được chọn.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
