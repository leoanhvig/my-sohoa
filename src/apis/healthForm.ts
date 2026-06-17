import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export type HealthFormRecord = Record<string, unknown> & {
  uid: string
  creator: string
  created_at?: ReturnType<typeof serverTimestamp>
  updated_at?: ReturnType<typeof serverTimestamp>
}

const HEALTH_FORM_COLLECTION = 'HealthForm'

export async function getHealthFormRecordsByCreator(
  creator: string
): Promise<HealthFormRecord[]> {
  if (!creator) return []

  const healthFormQuery = query(
    collection(db, HEALTH_FORM_COLLECTION),
    where('creator', '==', creator)
  )
  const snapshot = await getDocs(healthFormQuery)

  return snapshot.docs.map((document) => ({
    uid: document.id,
    ...document.data(),
  })) as HealthFormRecord[]
}

export async function getHealthFormRecordsCountByCreator(
  creator: string
): Promise<number> {
  if (!creator) return 0

  const healthFormQuery = query(
    collection(db, HEALTH_FORM_COLLECTION),
    where('creator', '==', creator)
  )
  const snapshot = await getDocs(healthFormQuery)

  return snapshot.size
}
