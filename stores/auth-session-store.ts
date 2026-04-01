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
  accessTokenExpiresAt?: string | null
  refreshTokenExpiresAt?: string | null
  serverTime?: string | null
  permissions: RolePermissions | null
}

/** Max idle time (ms) before the client-side session is considered stale and the user must re-login. */
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12 hours

interface AuthSessionState {
  user: User | null
  session: AuthSessionContext | null
  accessToken: string | null
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  serverTimeOffsetMs: number
  permissions: RolePermissions | null
  lastActiveAt: number | null
  hasHydrated: boolean
  setSession: (payload: SessionPayload) => void
  setSessionContext: (session: AuthSessionContext | null) => void
  setUser: (user: User | null) => void
  setTokens: (tokens: {
    accessToken: string
    accessTokenExpiresAt?: string | null
    refreshTokenExpiresAt?: string | null
    serverTime?: string | null
  }) => void
  setPermissions: (permissions: RolePermissions | null) => void
  touchActivity: () => void
  isSessionExpired: () => boolean
  clearSession: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

function resolveServerTimeOffsetMs(serverTime: string | null | undefined): number {
  if (!serverTime) return 0
  const timestamp = Date.parse(serverTime)
  if (Number.isNaN(timestamp)) return 0
  return timestamp - Date.now()
}

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      serverTimeOffsetMs: 0,
      permissions: null,
      lastActiveAt: null,
      hasHydrated: false,

      setSession: ({
        user,
        session,
        accessToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        serverTime,
        permissions,
      }) => {
        set({
          user,
          session,
          accessToken,
          accessTokenExpiresAt: accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: refreshTokenExpiresAt ?? null,
          serverTimeOffsetMs: resolveServerTimeOffsetMs(serverTime),
          permissions,
          lastActiveAt: Date.now(),
        })
      },

      setSessionContext: (session) => set({ session }),

      setUser: (user) => set({ user }),

      setTokens: ({
        accessToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        serverTime,
      }) => {
        set((state) => ({
          accessToken,
          accessTokenExpiresAt:
            accessTokenExpiresAt === undefined
              ? state.accessTokenExpiresAt
              : accessTokenExpiresAt,
          refreshTokenExpiresAt:
            refreshTokenExpiresAt === undefined
              ? state.refreshTokenExpiresAt
              : refreshTokenExpiresAt,
          serverTimeOffsetMs:
            serverTime === undefined
              ? state.serverTimeOffsetMs
              : resolveServerTimeOffsetMs(serverTime),
          lastActiveAt: Date.now(),
        }))
      },

      setPermissions: (permissions) => set({ permissions }),

      touchActivity: () => set({ lastActiveAt: Date.now() }),

      isSessionExpired: (): boolean => {
        const state = useAuthSessionStore.getState()
        if (!state.lastActiveAt) return false // First-time migration: treat as not expired
        return Date.now() - (state.lastActiveAt as number) > SESSION_MAX_AGE_MS
      },

      clearSession: () => {
        set({
          user: null,
          session: null,
          accessToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          serverTimeOffsetMs: 0,
          permissions: null,
          lastActiveAt: null,
        })
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage
      ),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
        serverTimeOffsetMs: state.serverTimeOffsetMs,
        permissions: state.permissions,
        lastActiveAt: state.lastActiveAt,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState as AuthSessionState
        }

        const state = persistedState as Partial<AuthSessionState>

        if (version < 2) {
          return {
            ...state,
            accessToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: state.refreshTokenExpiresAt ?? null,
          } as AuthSessionState
        }

        return state as AuthSessionState
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function getAuthSessionState() {
  return useAuthSessionStore.getState()
}
