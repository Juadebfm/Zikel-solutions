import { create } from "zustand"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"

import type { AuthSessionContext, RolePermissions, User } from "@/types"

const STORAGE_KEY = "nexus-auth-session"

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

interface SessionPayload {
  user: User
  session: AuthSessionContext
  accessToken: string
  refreshToken: string | null
  permissions: RolePermissions | null
}

/** Max idle time (ms) before the client-side session is considered stale and the user must re-login. */
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12 hours

interface AuthSessionState {
  user: User | null
  session: AuthSessionContext | null
  accessToken: string | null
  refreshToken: string | null
  permissions: RolePermissions | null
  lastActiveAt: number | null
  hasHydrated: boolean
  setSession: (payload: SessionPayload) => void
  setSessionContext: (session: AuthSessionContext | null) => void
  setUser: (user: User | null) => void
  setTokens: (tokens: { accessToken: string; refreshToken?: string | null }) => void
  setPermissions: (permissions: RolePermissions | null) => void
  touchActivity: () => void
  isSessionExpired: () => boolean
  clearSession: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      accessToken: null,
      refreshToken: null,
      permissions: null,
      lastActiveAt: null,
      hasHydrated: false,

      setSession: ({ user, session, accessToken, refreshToken, permissions }) => {
        set({ user, session, accessToken, refreshToken, permissions, lastActiveAt: Date.now() })
      },

      setSessionContext: (session) => set({ session }),

      setUser: (user) => set({ user }),

      setTokens: ({ accessToken, refreshToken }) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
          lastActiveAt: Date.now(),
        }))
      },

      setPermissions: (permissions) => set({ permissions }),

      touchActivity: () => set({ lastActiveAt: Date.now() }),

      isSessionExpired: (): boolean => {
        const state = useAuthSessionStore.getState()
        if (!state.accessToken) return true
        if (!state.lastActiveAt) return false // First-time migration: treat as not expired
        return Date.now() - (state.lastActiveAt as number) > SESSION_MAX_AGE_MS
      },

      clearSession: () => {
        set({ user: null, session: null, accessToken: null, refreshToken: null, permissions: null, lastActiveAt: null })
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
        session: state.session,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        lastActiveAt: state.lastActiveAt,
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
