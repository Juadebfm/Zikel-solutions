import { create } from "zustand"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"

import type { RolePermissions, User } from "@/types"

const STORAGE_KEY = "nexus-auth-session"

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

interface SessionPayload {
  user: User
  accessToken: string
  refreshToken: string
  permissions: RolePermissions | null
}

interface AuthSessionState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  permissions: RolePermissions | null
  hasHydrated: boolean
  setSession: (payload: SessionPayload) => void
  setUser: (user: User | null) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  setPermissions: (permissions: RolePermissions | null) => void
  clearSession: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: null,
      hasHydrated: false,

      setSession: ({ user, accessToken, refreshToken, permissions }) => {
        set({ user, accessToken, refreshToken, permissions })
      },

      setUser: (user) => set({ user }),

      setTokens: ({ accessToken, refreshToken }) => {
        set({ accessToken, refreshToken })
      },

      setPermissions: (permissions) => set({ permissions }),

      clearSession: () => {
        set({ user: null, accessToken: null, refreshToken: null, permissions: null })
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function getAuthSessionState() {
  return useAuthSessionStore.getState()
}
