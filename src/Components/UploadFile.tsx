import { CheckCircle2, FolderOpen, Loader2, RefreshCw } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import {
  extractDriveFolderId,
  syncDriveFolder,
  SyncDriveFolderResponse,
} from '../apis/drive'
import { useUserStore } from '../stores/userStore'
import { Button } from './ui/button'
import { Input } from './ui/input'

const EXAMPLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1XIEoO8HJBbr1jzgHOlaxzC69Oq0Yrj_y?usp=sharing'

export default function UploadFile() {
  const authUser = useUserStore((state) => state.authUser)
  const [folderUrl, setFolderUrl] = useState(EXAMPLE_DRIVE_FOLDER_URL)
  const [folderName, setFolderName] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [syncResult, setSyncResult] = useState<SyncDriveFolderResponse | null>(
    null
  )

  const folderId = useMemo(() => extractDriveFolderId(folderUrl), [folderUrl])

  async function handleSyncDriveFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!authUser?.uid) {
      setError('You must be logged in to sync Google Drive folder.')
      return
    }

    if (!folderId) {
      setError('Please enter a valid Google Drive folder URL or folder ID.')
      return
    }

    try {
      setError('')
      setSuccess('')
      setSyncResult(null)
      setSyncing(true)

      const result = await syncDriveFolder({
        folderUrl,
        folderName: folderName.trim() || undefined,
      })

      setSyncResult(result)
      setSuccess(
        `Synced ${result.createdDocuments} new files and skipped ${result.skippedDocuments} existing files from ${result.folderName}.`
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to sync Google Drive folder.'
      setError(message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sync Google Drive folder
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Nhập link folder Google Drive, hệ thống sẽ đọc PDF/image và lưu
                metadata vào Firebase. Không upload file từ máy local.
              </p>
            </div>
            <FolderOpen className="h-10 w-10 text-indigo-600" />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSyncDriveFolder}>
            <div className="space-y-2">
              <label
                htmlFor="drive-folder-url"
                className="text-sm font-semibold text-slate-700"
              >
                Google Drive folder URL hoặc folder ID
              </label>
              <Input
                id="drive-folder-url"
                value={folderUrl}
                onChange={(event) => setFolderUrl(event.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
              />
              <p className="text-xs text-slate-500">
                Folder ID nhận được:{' '}
                <span className="font-semibold text-slate-700">
                  {folderId || 'Chưa có'}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="drive-folder-name"
                className="text-sm font-semibold text-slate-700"
              >
                Tên folder tuỳ chọn
              </label>
              <Input
                id="drive-folder-name"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="Để trống để lấy tên folder từ Google Drive"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={syncing}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync Drive folder
                </>
              )}
            </Button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Kết quả sync</h2>
            <p className="text-sm text-slate-500">
              App sẽ tạo/reuse record File theo Drive folder ID và chỉ tạo
              Documents cho file chưa tồn tại.
            </p>
          </div>

          <div className="p-6">
            {syncResult ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Folder
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {syncResult.folderName}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Total files
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {syncResult.totalFiles}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-600">
                    Created
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {syncResult.createdDocuments}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase text-amber-600">
                    Skipped
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-700">
                    {syncResult.skippedDocuments}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-8 text-sm text-slate-500">
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
                Chưa có kết quả sync. Nhập folder Drive và bấm Sync.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
