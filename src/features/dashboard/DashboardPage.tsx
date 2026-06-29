import { claimFileRecord } from '@/apis/file'
import { DashboardFile, useDashboardFiles } from '@/hooks/useDashboardFiles'
import { useUserStore } from '@/stores/userStore'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardFilesTable } from './components/DashboardFilesTable'
import { DashboardHeader } from './components/DashboardHeader'
import { DashboardStats } from './components/DashboardStats'

export default function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authUser = useUserStore((state) => state.authUser)
  const userRecord = useUserStore((state) => state.userRecord)
  const userName = userRecord?.user_name ?? authUser?.email ?? 'người dùng'
  const [globalFilter, setGlobalFilter] = useState('')
  const [claimingFileUid, setClaimingFileUid] = useState('')
  const { files, loading, error, refetch } = useDashboardFiles(authUser?.uid)

  const handleViewFile = useCallback(
    (fileUid: string) => {
      navigate(`/file/${fileUid}`)
    },
    [navigate]
  )

  const handleClaimFile = useCallback(
    async (file: DashboardFile) => {
      if (!authUser?.uid) return

      try {
        setClaimingFileUid(file.uid)
        await claimFileRecord({
          fileUid: file.uid,
          userUid: authUser.uid,
        })
        await refetch()
        await queryClient.invalidateQueries({
          queryKey: ['files'],
        })
        handleViewFile(file.uid)
      } finally {
        setClaimingFileUid('')
      }
    },
    [authUser?.uid, handleViewFile, queryClient, refetch]
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <DashboardHeader
            userName={userName}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
          <DashboardStats />
        </section>

        <DashboardFilesTable
          files={files}
          loading={loading}
          error={error}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          claimingFileUid={claimingFileUid}
          onClaimFile={handleClaimFile}
          onViewFile={handleViewFile}
        />
      </div>
    </main>
  )
}
