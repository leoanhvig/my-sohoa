import type { DocumentRecord } from '@/apis/document'
import { Button } from '@/Components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

type DocumentDetailHeaderProps = {
  documentRecord?: DocumentRecord | null
  onBack: () => void
}

export function DocumentDetailHeader({
  documentRecord,
  onBack,
}: DocumentDetailHeaderProps) {
  return (
    <header className="z-10 flex min-h-[56px] items-center justify-between gap-4 bg-amber-400 px-3 py-2 text-slate-950 shadow-md">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-8 shrink-0 border-slate-900 bg-transparent px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300"
          onClick={onBack}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Về Dashboard
        </Button>

        <div className="flex min-w-0 items-center gap-2 text-sm font-bold">
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {documentRecord?.relative_path ||
              documentRecord?.file_name ||
              'Đang tải hồ sơ...'}
          </span>
        </div>
      </div>
    </header>
  )
}
