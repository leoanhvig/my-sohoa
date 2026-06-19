import {
  getDocumentsCount,
  getEnteredDocumentsCountByUser,
  getUnenteredDocumentsCount,
} from '@/apis/document'
import StatsCard from '@/Components/StatsCard'
import { useUserStore } from '@/stores/userStore'
import { useQuery } from '@tanstack/react-query'

export function DashboardStats() {
  const authUser = useUserStore((state) => state.authUser)
  const userUid = authUser?.uid || ''
  const { data: totalFiles = 0, isLoading: loadingTotalFiles } = useQuery({
    queryKey: ['documents', 'total-count'],
    queryFn: getDocumentsCount,
  })
  const {
    data: unassignedFilesCount = 0,
    isLoading: loadingUnassignedFilesCount,
  } = useQuery({
    queryKey: ['documents', 'unentered-count'],
    queryFn: getUnenteredDocumentsCount,
  })
  const { data: enteredFilesCount = 0, isLoading: loadingEnteredFilesCount } =
    useQuery({
      queryKey: ['documents', 'entered-count', userUid],
      queryFn: () => getEnteredDocumentsCountByUser(userUid),
      enabled: Boolean(userUid),
    })

  return (
    <div className="grid gap-4 p-6 md:grid-cols-3">
      <StatsCard
        title="Tổng hồ sơ"
        value={totalFiles}
        loading={loadingTotalFiles}
      />
      <StatsCard
        title="Hồ sơ chưa phân công"
        value={unassignedFilesCount}
        loading={loadingUnassignedFilesCount}
      />
    </div>
  )
}
