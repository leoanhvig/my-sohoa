import { Button } from '@/Components/ui/button'
import { HealthFormRecord } from '@/apis/healthForm2'
import { FileText, UploadCloud } from 'lucide-react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import FormSK2 from './FormSK2'
import HealthForm2List from './HealthForm2List'

type HealthForm2Tab = 'form' | 'records'

export default function HealthForm2() {
  const [localPreviewUrl, setLocalPreviewUrl] = useState('')
  const [activeTab, setActiveTab] = useState<HealthForm2Tab>('form')
  const [selectedUpdateRecord, setSelectedUpdateRecord] =
    useState<HealthFormRecord | null>(null)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  function handleLocalPdfChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''

    if (!selectedFile) {
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)

    setLocalPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return objectUrl
    })
  }

  function handleSelectRecordForUpdate(record: HealthFormRecord) {
    setSelectedUpdateRecord(record)
    setActiveTab('form')
  }

  return (
    <main className="grid h-screen overflow-hidden bg-slate-100 text-slate-900 md:grid-cols-[minmax(0,1.3fr)_minmax(420px,1fr)]">
      <section className="relative h-screen min-h-0 border-r border-slate-300 bg-slate-600">
        <input
          ref={uploadInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleLocalPdfChange}
        />

        <Button
          type="button"
          className="absolute right-4 top-4 z-10 bg-indigo-600 font-bold text-white shadow-lg hover:bg-indigo-700"
          onClick={() => uploadInputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" /> Upload PDF
        </Button>

        {localPreviewUrl ? (
          <iframe
            key={localPreviewUrl}
            title="Health Form 2 PDF preview"
            src={`${localPreviewUrl}#toolbar=1&navpanes=1&page=1`}
            width="100%"
            height="100%"
            className="h-screen w-full border-0 bg-white"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <FileText className="mb-4 h-12 w-12 text-slate-200" />
            <h1 className="text-xl font-bold">Upload PDF để xem trước</h1>
            <p className="mt-2 max-w-md text-sm font-medium text-slate-200">
              Chọn file PDF từ máy để hiển thị bên trái, sau đó nhập thông tin
              Health Form ở panel bên phải và lưu vào database.
            </p>
          </div>
        )}
      </section>

      <section className="flex h-screen min-h-0 flex-col bg-slate-50">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === 'form'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Form SK2
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === 'records'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('records')}
            >
              Records HealthForm2
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {activeTab === 'form' ? (
            <FormSK2
              updateRecordOverride={selectedUpdateRecord}
              onUpdateSuccess={() => setSelectedUpdateRecord(null)}
            />
          ) : (
            <HealthForm2List
              embedded
              filterRecordsByExamInfo
              onSelectRecordForUpdate={handleSelectRecordForUpdate}
            />
          )}
        </div>
      </section>
    </main>
  )
}
