import { useQuery } from '@tanstack/react-query'
import { getUnassignedFilesCount } from '../apis/file'

export function useUnassignedFilesCount() {
  return useQuery({
    queryKey: ['files', 'unassigned-count'],
    queryFn: getUnassignedFilesCount,
  })
}
