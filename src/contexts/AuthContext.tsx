import {
  createUserWithEmailAndPassword,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth'
import React, { useContext, useEffect, useState } from 'react'
import { createUserRecord, getUserByUid } from '../apis/user'
import { auth } from '../firebase'
import { useUserStore } from '../stores/userStore'

interface IAuthProviderProps {
  children: React.ReactNode
}

interface IAuthContext {
  currentUser: User | null
  signup: (email: string, password: string) => Promise<UserCredential>
  login: (email: string, password: string) => Promise<any>
  googleSignin: () => Promise<any>
  githubSignin: () => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  getCurrentUserToken: () => Promise<string | null>
}

const AuthContext = React.createContext<IAuthContext | null>(null)

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: IAuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const setAuthUser = useUserStore((state) => state.setAuthUser)
  const setUserRecord = useUserStore((state) => state.setUserRecord)
  const setUserStoreLoading = useUserStore((state) => state.setLoading)
  const clearUser = useUserStore((state) => state.clearUser)

  async function signup(
    email: string,
    password: string
  ): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    await createUserRecord({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    })

    return userCredential
  }

  function googleSignin(): Promise<any> {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  function githubSignin(): Promise<any> {
    const provider = new GithubAuthProvider()
    return signInWithPopup(auth, provider)
  }

  function login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout(): Promise<void> {
    return signOut(auth)
  }

  function resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email)
  }

  function getCurrentUserToken(): Promise<string | null> {
    return auth.currentUser
      ? auth.currentUser.getIdToken()
      : Promise.resolve(null)
  }

  function updateEmail(email: string): Promise<void> {
    if (!auth.currentUser) {
      return Promise.reject(new Error('No authenticated user'))
    }
    return firebaseUpdateEmail(auth.currentUser, email)
  }

  function updatePassword(password: string): Promise<void> {
    if (!auth.currentUser) {
      return Promise.reject(new Error('No authenticated user'))
    }
    return firebaseUpdatePassword(auth.currentUser, password)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      setAuthUser(user)
      setUserStoreLoading(true)

      if (user) {
        const userRecord = await getUserByUid(user.uid)
        setUserRecord(userRecord)
      } else {
        clearUser()
      }

      setUserStoreLoading(false)
      setLoading(false)
    })

    return unsubscribe
  }, [clearUser, setAuthUser, setUserRecord, setUserStoreLoading])

  const value: IAuthContext = {
    currentUser,
    login,
    signup,
    googleSignin,
    githubSignin,
    logout,
    resetPassword,
    getCurrentUserToken,
    updateEmail,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
