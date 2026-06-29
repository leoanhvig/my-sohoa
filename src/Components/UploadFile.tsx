import { FileUp, Loader2 } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { createDocumentRecord } from '../apis/document'
import { createFileRecord } from '../apis/file'
import { uploadPdfFiles } from '../apis/storage'
import { useUserStore } from '../stores/userStore'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function UploadFile() {
  const authUser = useUserStore((state) => state.authUser)
  const [localFolderName, setLocalFolderName] = useState('')
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')

  function handlePdfFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || [])
    const validPdfFiles = selectedFiles.filter(
      (file) => file.type === 'application/pdf' || file.name.endsWith('.pdf')
    )

    setPdfFiles(validPdfFiles)
    setLocalSuccess('')

    if (selectedFiles.length !== validPdfFiles.length) {
      setLocalError('Chỉ hỗ trợ upload file PDF.')
      return
    }

    setLocalError('')
  }

  async function handleUploadLocalPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    if (!authUser?.uid) {
      setLocalError('Bạn cần đăng nhập để upload PDF.')
      return
    }

    if (pdfFiles.length === 0) {
      setLocalError('Vui lòng chọn ít nhất 1 file PDF.')
      return
    }

    try {
      setUploading(true)
      setLocalError('')
      setLocalSuccess('')

      const fileRecord = await createFileRecord({
        file_name:
          localFolderName.trim() ||
          `PDF upload ${new Date().toLocaleString('vi-VN')}`,
        number_of_file: pdfFiles.length,
        creator_uid: authUser.uid,
        updated_uid: authUser.uid,
        storage_provider: 'firebase_storage',
      })
      const uploadedFiles = await uploadPdfFiles({ files: pdfFiles })

      for (const uploadedFile of uploadedFiles) {
        await createDocumentRecord({
          uid_file: fileRecord.uid,
          file_name: uploadedFile.originalName,
          relative_path: `${fileRecord.file_name}/${uploadedFile.originalName}`,
          storage_path: uploadedFile.storagePath,
          download_url: uploadedFile.downloadUrl,
          storage_provider: 'firebase_storage',
        })
      }

      setPdfFiles([])
      setLocalFolderName('')
      setLocalSuccess(
        `Đã upload ${pdfFiles.length} PDF và tạo hồ sơ nhập liệu thành công.`
      )
      form.reset()
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Không upload được file PDF.'
      )
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
                Upload PDF từ máy
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Upload PDF lên server của project và tạo hồ sơ trong Firebase để
                mở bằng trình xem PDF của app. Máy khác dùng được nếu cùng truy
                cập được API server đang lưu file PDF.
              </p>
            </div>
            <FileUp className="h-10 w-10 text-indigo-600" />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleUploadLocalPdf}>
            <div className="space-y-2">
              <label
                htmlFor="local-folder-name"
                className="text-sm font-semibold text-slate-700"
              >
                Tên bộ hồ sơ
              </label>
              <Input
                id="local-folder-name"
                value={localFolderName}
                onChange={(event) => setLocalFolderName(event.target.value)}
                placeholder="Ví dụ: Hồ sơ PDF tháng 06"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="local-pdf-files"
                className="text-sm font-semibold text-slate-700"
              >
                Chọn file PDF
              </label>
              <Input
                id="local-pdf-files"
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={handlePdfFilesChange}
              />
              <p className="text-xs text-slate-500">
                Đã chọn{' '}
                <span className="font-semibold text-slate-700">
                  {pdfFiles.length}
                </span>{' '}
                file PDF.
              </p>
            </div>

            {localError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {localError}
              </div>
            )}

            {localSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {localSuccess}
              </div>
            )}

            <Button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                  upload...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" /> Upload PDF để nhập liệu
                </>
              )}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
