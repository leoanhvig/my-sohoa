import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

export async function getHealthFormRecordById(
  recordId: string
): Promise<HealthFormRecord | null> {
  if (!recordId) return null

  const document = await getDoc(doc(db, HEALTH_FORM_COLLECTION, recordId))

  if (!document.exists()) return null

  return {
    uid: document.id,
    ...document.data(),
  } as HealthFormRecord
}

export async function updateHealthFormRecord(
  recordId: string,
  record: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, HEALTH_FORM_COLLECTION, recordId), {
    ...record,
    updated_at: serverTimestamp(),
  })
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
    where('creator', '==', creator),
    orderBy('created_at', 'desc')
  )
  const snapshot = await getDocs(healthFormQuery)

  return snapshot.docs.map((document) => ({
    uid: document.id,
    ...document.data(),
  })) as HealthFormRecord[]
}

export async function getHealthFormRecordsByCreatorAndExamInfo({
  creator,
  clinicLocation,
  examDate,
}: {
  creator: string
  clinicLocation: string
  examDate: string
}): Promise<HealthFormRecord[]> {
  if (!creator || !clinicLocation || !examDate) return []

  const healthFormQuery = query(
    collection(db, HEALTH_FORM_COLLECTION),
    where('creator', '==', creator),
    where('clinicLocation', '==', clinicLocation),
    where('examDate', '==', examDate)
  )
  const snapshot = await getDocs(healthFormQuery)

  return snapshot.docs.map((document) => ({
    uid: document.id,
    ...document.data(),
  })) as HealthFormRecord[]
}

export async function getAllHealthFormRecords(): Promise<HealthFormRecord[]> {
  const snapshot = await getDocs(collection(db, HEALTH_FORM_COLLECTION))

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
  const snapshot = await getCountFromServer(healthFormQuery)

  return snapshot.data().count
}

export async function getHealthFormRecordsTotalCount(): Promise<number> {
  const snapshot = await getCountFromServer(
    collection(db, HEALTH_FORM_COLLECTION)
  )

  return snapshot.data().count
}
