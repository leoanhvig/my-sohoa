import {
  getDocumentDetailsCountByCreator,
  getUncompletedDocumentsCountByEnteredUser,
  getUnenteredDocumentsCount,
} from '@/apis/document'
import StatsCard from '@/Components/StatsCard'
import { Button } from '@/Components/ui/button'
import { useUserStore } from '@/stores/userStore'
import { useQuery } from '@tanstack/react-query'
import { FilePenLine, Loader2 } from 'lucide-react'
import { useClaimRandomDocument } from '../hooks/useClaimRandomDocument'

export function DashboardStats() {
  const authUser = useUserStore((state) => state.authUser)
  const { claimRandomDocument, isClaiming, error } = useClaimRandomDocument()
  const { data: totalDocumentDetails = 0, isLoading: loadingTotalFiles } =
    useQuery({
      queryKey: ['DocumentDetails', 'creator-count', authUser?.uid],
      queryFn: () => getDocumentDetailsCountByCreator(authUser?.uid || ''),
      enabled: Boolean(authUser?.uid),
    })
  const {
    data: unassignedFilesCount = 0,
    isLoading: loadingUnassignedFilesCount,
  } = useQuery({
    queryKey: ['documents', 'unentered-count'],
    queryFn: getUnenteredDocumentsCount,
  })
  const { data: uncompletedFilesCount = 0 } = useQuery({
    queryKey: ['documents', 'uncompleted-count', authUser?.uid],
    queryFn: () =>
      getUncompletedDocumentsCountByEnteredUser(authUser?.uid || ''),
    enabled: Boolean(authUser?.uid),
  })
  const canClaimRandomDocument =
    Boolean(authUser?.uid) &&
    !isClaiming &&
    unassignedFilesCount > 0 &&
    uncompletedFilesCount === 0

  return (
    <div className="grid gap-4 p-6 md:grid-cols-3">
      <StatsCard
        title="Tổng hồ sơ đã nhập"
        value={totalDocumentDetails}
        loading={loadingTotalFiles}
      />
      <StatsCard
        title="Hồ sơ chưa phân công"
        value={unassignedFilesCount}
        loading={loadingUnassignedFilesCount}
      />
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center shadow-sm">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">
          Nhận hồ sơ
        </h2>
        {uncompletedFilesCount === 0 && (
          <Button
            type="button"
            disabled={!canClaimRandomDocument}
            className="mx-auto bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={claimRandomDocument}
          >
            {isClaiming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilePenLine className="mr-2 h-4 w-4" />
            )}
            Nhận file ngẫu nhiên
          </Button>
        )}
        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
