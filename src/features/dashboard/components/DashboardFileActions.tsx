import { Button } from '@/Components/ui/button'
import { DashboardFile } from '@/hooks/useDashboardFiles'
import { Eye, FilePenLine, Loader2 } from 'lucide-react'

interface DashboardFileActionsProps {
  file: DashboardFile
  isClaiming: boolean
  onClaimFile: (file: DashboardFile) => void
  onViewFile: (fileUid: string) => void
}

export function DashboardFileActions({
  file,
  isClaiming,
  onClaimFile,
  onViewFile,
}: DashboardFileActionsProps) {
  if (file.isUnassigned) {
    return (
      <Button
        type="button"
        size="sm"
        disabled={isClaiming}
        className="bg-indigo-600 text-white hover:bg-indigo-700"
        onClick={() => onClaimFile(file)}
      >
        {isClaiming ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FilePenLine className="mr-2 h-4 w-4" />
        )}
        Nhận file
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => onViewFile(file.uid)}
    >
      <Eye className="mr-2 h-4 w-4" /> View file
    </Button>
  )
}
