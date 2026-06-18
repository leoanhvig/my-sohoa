import {
  addDoc,
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

export async function addHealthFormRecord(
  record: Record<string, unknown>
): Promise<string> {
  const document = await addDoc(collection(db, HEALTH_FORM_COLLECTION), {
    ...record,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  return document.id
}

export async function findDuplicateHealthFormRecord({
  creator,
  patientCode,
  fullName,
  examDate,
  clinicLocation,
}: {
  creator: string
  patientCode: string
  fullName: string
  examDate: string
  clinicLocation: string
}): Promise<HealthFormRecord | null> {
  if (!creator) return null

  const healthFormQuery = query(
    collection(db, HEALTH_FORM_COLLECTION),
    where('creator', '==', creator)
  )
  const snapshot = await getDocs(healthFormQuery)
  const document = snapshot.docs.find((doc) => {
    const data = doc.data()

    return (
      data.patientCode === patientCode &&
      data.fullName === fullName &&
      data.examDate === examDate &&
      data.clinicLocation === clinicLocation
    )
  })

  if (!document) return null

  return {
    uid: document.id,
    ...document.data(),
  } as HealthFormRecord
}

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
