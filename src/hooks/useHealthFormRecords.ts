import { useQuery } from '@tanstack/react-query'
import {
  getHealthFormRecordsByCreator,
  getHealthFormRecordsCountByCreator,
  getHealthFormRecordsTotalCount,
} from '../apis/healthForm'

const HEALTH_FORM_RECORDS_CACHE_TIME = 3 * 60 * 1000

export function useHealthFormRecords(creator?: string) {
  return useQuery({
    queryKey: ['health-form', 'records', creator],
    queryFn: () => getHealthFormRecordsByCreator(creator || ''),
    enabled: Boolean(creator),
    staleTime: HEALTH_FORM_RECORDS_CACHE_TIME,
    gcTime: HEALTH_FORM_RECORDS_CACHE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export function useHealthFormRecordsCount(creator?: string) {
  return useQuery({
    queryKey: ['health-form', 'records-count', creator],
    queryFn: () => getHealthFormRecordsCountByCreator(creator || ''),
    enabled: Boolean(creator),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })
}

export function useHealthFormRecordsTotalCount() {
  return useQuery({
    queryKey: ['health-form', 'records-total-count'],
    queryFn: getHealthFormRecordsTotalCount,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })
}
