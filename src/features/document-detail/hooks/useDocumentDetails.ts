import { getDocumentInfosByDocumentUid } from '@/apis/document'
import { useQuery } from '@tanstack/react-query'

export function useDocumentDetails(documentId?: string) {
  return useQuery({
    queryKey: ['DocumentDetails', documentId],
    queryFn: () => getDocumentInfosByDocumentUid(documentId || ''),
    enabled: Boolean(documentId),
  })
}
