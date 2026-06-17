import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from './ui/button'

export default function FileDetail() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>

          <div className="mt-6">
            <h1 className="text-2xl font-bold text-slate-900">File detail</h1>
            <p className="mt-2 text-sm text-slate-500">
              File ID:{' '}
              <span className="font-semibold text-slate-900">
                {fileId || 'Không có'}
              </span>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
