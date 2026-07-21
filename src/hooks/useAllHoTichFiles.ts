import { useQuery } from '@tanstack/react-query'
import { getAllHoTichFileRecords } from '../apis/file'

export function useAllHoTichFiles() {
  return useQuery({
    queryKey: ['ho-tich-files', 'all'],
    queryFn: getAllHoTichFileRecords,
  })
}