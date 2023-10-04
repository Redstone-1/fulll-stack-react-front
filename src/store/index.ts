import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userName: string
  setUserName: (userName: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: '',
      setUserName: (userName) => set(() => ({ userName: userName })),
    }),
    {
      name: 'user-storage',
    }
  )
)
