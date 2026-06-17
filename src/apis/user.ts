import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { generateDefaultUserName } from '../lib/utils'

export interface CreateUserRecordParams {
  uid: string
  email: string | null
}

export interface UserRecord {
  uid: string
  email: string | null
  user_name: string
  created_at: ReturnType<typeof serverTimestamp>
}

const USERS_COLLECTION = 'Users'

export async function getUsersCount(): Promise<number> {
  const usersCollection = collection(db, USERS_COLLECTION)
  const snapshot = await getDocs(usersCollection)

  return snapshot.size
}

export async function createUserRecord({
  uid,
  email,
}: CreateUserRecordParams): Promise<UserRecord> {
  const userCount = await getUsersCount()
  const userName = generateDefaultUserName(userCount)
  const userRecord: UserRecord = {
    uid,
    email,
    user_name: userName,
    created_at: serverTimestamp(),
  }

  await setDoc(doc(db, USERS_COLLECTION, uid), userRecord)

  return userRecord
}

export async function getUserByUid(uid: string): Promise<UserRecord | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid))

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as UserRecord
}

export async function getUserByUserName(
  userName: string
): Promise<UserRecord | null> {
  const usersCollection = collection(db, USERS_COLLECTION)
  const usersQuery = query(
    usersCollection,
    where('user_name', '==', userName),
    limit(1)
  )
  const snapshot = await getDocs(usersQuery)

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].data() as UserRecord
}
