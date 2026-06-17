import { useQuery } from '@tanstack/react-query'
import { getAllFileRecords } from '../apis/file'

export function useAllFiles() {
  return useQuery({
    queryKey: ['files', 'all'],
    queryFn: getAllFileRecords,
  })
}
