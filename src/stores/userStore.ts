import { User } from 'firebase/auth'
import { create } from 'zustand'
import { UserRecord } from '../apis/user'

interface UserStoreState {
  authUser: User | null
  userRecord: UserRecord | null
  loading: boolean
  setAuthUser: (authUser: User | null) => void
  setUserRecord: (userRecord: UserRecord | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
}

export const useUserStore = create<UserStoreState>((set) => ({
  authUser: null,
  userRecord: null,
  loading: true,
  setAuthUser: (authUser) => set({ authUser }),
  setUserRecord: (userRecord) => set({ userRecord }),
  setLoading: (loading) => set({ loading }),
  clearUser: () =>
    set({
      authUser: null,
      userRecord: null,
      loading: false,
    }),
}))
