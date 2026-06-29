import { FileUp, Loader2 } from 'lucide-react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { ChangeEvent, FormEvent, useState } from 'react'
import { pdfjs } from 'react-pdf'
import { createFileRecord } from '../apis/file'
import { uploadPdfFiles } from '../apis/storage'
import { useUserStore } from '../stores/userStore'
import { Button } from './ui/button'
import { Input } from './ui/input'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const MAX_PDF_FILE_SIZE_MB = 1024
const MAX_PDF_FILE_SIZE_BYTES = MAX_PDF_FILE_SIZE_MB * 1024 * 1024

function getPdfFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`
}

async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
  const pdfDocument = await loadingTask.promise

  return pdfDocument.numPages
}

export default function UploadFile() {
  const authUser = useUserStore((state) => state.authUser)
  const [localFolderName, setLocalFolderName] = useState('')
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [pdfPageCounts, setPdfPageCounts] = useState<Record<string, number>>({})
  const [readingPdfPages, setReadingPdfPages] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')

  const totalPdfPages = pdfFiles.reduce(
    (totalPages, file) =>
      totalPages + (pdfPageCounts[getPdfFileKey(file)] || 0),
    0
  )

  async function handlePdfFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || [])
    const validPdfFiles = selectedFiles.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
    )

    setPdfFiles(validPdfFiles)
    setPdfPageCounts({})
    if (validPdfFiles.length > 0) {
      setLocalFolderName(validPdfFiles[0].name.replace(/\.pdf$/i, ''))
    }
    setLocalSuccess('')

    if (selectedFiles.length !== validPdfFiles.length) {
      setLocalError('Chỉ hỗ trợ upload file PDF.')
      return
    }

    const oversizedFile = validPdfFiles.find(
      (file) => file.size > MAX_PDF_FILE_SIZE_BYTES
    )

    if (oversizedFile) {
      setPdfFiles([])
      setPdfPageCounts({})
      setLocalError(
        `File "${oversizedFile.name}" quá lớn. Giới hạn hiện tại là ${MAX_PDF_FILE_SIZE_MB}MB mỗi file.`
      )
      return
    }

    setLocalError('')

    if (validPdfFiles.length === 0) {
      return
    }

    try {
      setReadingPdfPages(true)
      const pageCountEntries = await Promise.all(
        validPdfFiles.map(async (file) => [
          getPdfFileKey(file),
          await getPdfPageCount(file),
        ])
      )

      setPdfPageCounts(Object.fromEntries(pageCountEntries))
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? `Không đọc được số trang PDF: ${err.message}`
          : 'Không đọc được số trang PDF.'
      )
    } finally {
      setReadingPdfPages(false)
    }
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

    if (readingPdfPages) {
      setLocalError('Đang đọc số trang PDF, vui lòng chờ trong giây lát.')
      return
    }

    try {
      setUploading(true)
      setLocalError('')
      setLocalSuccess('')

      const uploadedFiles = await uploadPdfFiles({ files: pdfFiles })

      for (const uploadedFile of uploadedFiles) {
        const originalFile = pdfFiles.find(
          (file) => file.name === uploadedFile.originalName
        )
        const pageCount = originalFile
          ? pdfPageCounts[getPdfFileKey(originalFile)] || 1
          : 1
        const fileNameWithoutExtension = uploadedFile.originalName.replace(
          /\.pdf$/i,
          ''
        )
        await createFileRecord({
          file_name: fileNameWithoutExtension,
          number_of_file: pageCount,
          number_of_file_done: 0,
          enteredByUserId: '',
          relative_path: `${
            localFolderName.trim() || fileNameWithoutExtension
          }/${uploadedFile.originalName}`,
          storage_path: uploadedFile.storagePath,
          download_url: uploadedFile.downloadUrl,
          creator_uid: authUser.uid,
          updated_uid: authUser.uid,
          storage_provider: 'firebase_storage',
        })
      }

      setPdfFiles([])
      setPdfPageCounts({})
      setLocalFolderName('')
      setLocalSuccess(
        `Đã upload ${pdfFiles.length} PDF và tạo file thành công.`
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
                {readingPdfPages && ' Đang đọc số trang...'}
              </p>
              {pdfFiles.length > 0 && !readingPdfPages && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">
                    Gợi ý số trang sẽ lưu vào database:
                  </p>
                  <p className="mt-1 font-bold text-indigo-700">
                    Tổng số trang: {totalPdfPages || 'Chưa đọc được'}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {pdfFiles.map((file) => {
                      const pageCount = pdfPageCounts[getPdfFileKey(file)]

                      return (
                        <li key={getPdfFileKey(file)} className="flex gap-2">
                          <span className="min-w-0 flex-1 truncate">
                            {file.name}
                          </span>
                          <span className="font-bold text-indigo-700">
                            {pageCount ? `${pageCount} trang` : 'Chưa đọc được'}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
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
              disabled={uploading || readingPdfPages}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {uploading || readingPdfPages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                  {readingPdfPages ? ' đọc số trang...' : ' upload...'}
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
