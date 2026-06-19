import { useQuery } from '@tanstack/react-query'
import { getUnenteredDocumentsCount } from '../apis/document'

export function useUnassignedFilesCount() {
  return useQuery({
    queryKey: ['documents', 'unentered-count'],
    queryFn: getUnenteredDocumentsCount,
  })
}
