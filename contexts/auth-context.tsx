"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"

import { getApiErrorMessage, isApiClientError } from "@/lib/api/error"
import { logApiError } from "@/lib/api/logger"
import { getPublicAuthErrorMessage } from "@/lib/auth/otp"
import {
  clearPendingMfaRequest,
  consumeMfaReturnPath,
  retryPendingMfaRequest,
} from "@/lib/api/client"
import { useAuthSessionStore } from "@/stores/auth-session-store"
import { authService, type LoginPayload } from "@/services/auth.service"
import { summaryService } from "@/services/summary.service"
import type { SummaryTaskItem } from "@/services/summary.service"
import type { AuthSessionContext, RolePermissions, TenantRole, UserRole } from "@/types"
import { ROLE_PERMISSIONS } from "@/types"
import { useMfaStore } from "@/stores/mfa-store"

interface LoginResult {
  success: boolean
  message?: string
  requiresVerification?: boolean
  requiresMfa?: boolean
}

interface SessionExpiryState {
  idleExpiresAt: string | null
  absoluteExpiresAt: string | null
  warningWindowSeconds: number
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
}

interface AuthContextType {
  user: ReturnType<typeof useAuthSessionStore.getState>["user"]
  session: AuthSessionContext | null
  isLoading: boolean
  isAuthenticated: boolean
  permissions: RolePermissions | null
  hasPendingAcknowledgements: boolean
  /** Items fetched during the gate check — used to prime the query cache so the acknowledgements page loads instantly. */
  pendingAcknowledgementItems: SummaryTaskItem[] | null
  sessionExpiry: SessionExpiryState
  serverTimeOffsetMs: number
  syncSessionExpiry: () => Promise<boolean>
  staySignedIn: () => Promise<{ success: boolean; message?: string }>
  login: (email: string, password: string) => Promise<LoginResult>
  completeAuth: (payload: LoginPayload, redirectTo?: string) => Promise<void>
  refreshAcknowledgementsGate: () => Promise<boolean>
  switchTenant: (tenantId: string) => Promise<{ success: boolean; message?: string }>
  challengeMfa: () => Promise<{ success: boolean; message?: string; code?: string }>
  verifyMfa: (code: string) => Promise<{ success: boolean; message?: string; redirectTo?: string }>
  logout: () => Promise<void>
  hasPermission: (permission: keyof RolePermissions) => boolean
  isRole: (role: UserRole | UserRole[]) => boolean
  getRoleDisplay: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login", "/register", "/join", "/activate", "/forgot-password", "/reset-password", "/verify-email", "/mfa-verify"]

const GLOBAL_ROLE_DISPLAY: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
}

const TENANT_ROLE_DISPLAY: Record<TenantRole, string> = {
  tenant_admin: "Admin",
  sub_admin: "Sub Admin",
  staff: "Staff",
}

function getPreferredTenantId(session: AuthSessionContext | null | undefined): string | null {
  if (!session || session.memberships.length === 0) {
    return null
  }

  const activeMembership = session.memberships.find((membership) => membership.isActive)
  return activeMembership?.tenantId ?? session.memberships[0].tenantId
}

function hasActiveMembership(session: AuthSessionContext | null | undefined): boolean {
  if (!session) {
    return false
  }

  return session.memberships.some((membership) =>
    membership.status ? membership.status === "active" : membership.isActive
  )
}

function hasPendingApprovalMembership(session: AuthSessionContext | null | undefined): boolean {
  if (!session) {
    return false
  }

  return session.memberships.some((membership) => membership.status === "pending_approval")
}

function shouldRouteToPendingApproval(session: AuthSessionContext | null | undefined): boolean {
  return hasPendingApprovalMembership(session) && !hasActiveMembership(session)
}

function isTenantContextError(error: unknown): boolean {
  if (!isApiClientError(error)) {
    return false
  }

  return error.code === "TENANT_CONTEXT_REQUIRED" || error.code === "TENANT_ACCESS_DENIED"
}

function isSessionTerminalError(error: unknown): boolean {
  if (!isApiClientError(error)) {
    return false
  }

  return (
    error.code === "SESSION_IDLE_EXPIRED" ||
    error.code === "SESSION_ABSOLUTE_EXPIRED" ||
    error.code === "REFRESH_TOKEN_INVALID"
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const user = useAuthSessionStore((state) => state.user)
  const session = useAuthSessionStore((state) => state.session)
  const permissions = useAuthSessionStore((state) => state.permissions)
  const accessTokenExpiresAt = useAuthSessionStore((state) => state.accessTokenExpiresAt)
  const refreshTokenExpiresAt = useAuthSessionStore((state) => state.refreshTokenExpiresAt)
  const serverTimeOffsetMs = useAuthSessionStore((state) => state.serverTimeOffsetMs)
  const hasHydrated = useAuthSessionStore((state) => state.hasHydrated)
  const setSession = useAuthSessionStore((state) => state.setSession)
  const setSessionContext = useAuthSessionStore((state) => state.setSessionContext)
  const setUser = useAuthSessionStore((state) => state.setUser)
  const setTokens = useAuthSessionStore((state) => state.setTokens)
  const setPermissions = useAuthSessionStore((state) => state.setPermissions)
  const clearSession = useAuthSessionStore((state) => state.clearSession)

  const [isLoading, setIsLoading] = useState(true)
  const [hasPendingAcknowledgements, setHasPendingAcknowledgements] = useState(false)
  const [pendingAcknowledgementItems, setPendingAcknowledgementItems] = useState<SummaryTaskItem[] | null>(null)
  const [isCheckingAcknowledgements, setIsCheckingAcknowledgements] = useState(false)
  const hasBootstrapped = useRef(false)
  const lastSessionSyncAtRef = useRef(0)
  const mfaGateActive = useMfaStore((state) => state.mfaGateActive)
  const activateMfaGate = useMfaStore((state) => state.activateMfaGate)
  const deactivateMfaGate = useMfaStore((state) => state.deactivateMfaGate)
  const needsMfa = Boolean(user && session?.mfaRequired && !session?.mfaVerified)

  const refreshAcknowledgementsGate = useCallback(async (): Promise<boolean> => {
    // Approval gate removed by BE — scope=gate always returns [].
    // Skip the API call entirely to avoid an unnecessary request on every login.
    setHasPendingAcknowledgements(false)
    setPendingAcknowledgementItems(null)
    setIsCheckingAcknowledgements(false)
    return false
  }, [])

  const forceSessionResetToLogin = useCallback(() => {
    clearPendingMfaRequest()
    consumeMfaReturnPath()
    deactivateMfaGate()
    clearSession()
    setHasPendingAcknowledgements(false)
    setPendingAcknowledgementItems(null)
    hasBootstrapped.current = false
    router.push("/login")
  }, [clearSession, deactivateMfaGate, router])

  const syncSessionExpiry = useCallback(async (): Promise<boolean> => {
    try {
      const payload = await authService.getSessionExpiry()
      const currentSession = useAuthSessionStore.getState().session

      if (payload.session && currentSession) {
        setSessionContext({
          ...currentSession,
          idleExpiresAt: payload.session.idleExpiresAt ?? currentSession.idleExpiresAt ?? null,
          absoluteExpiresAt: payload.session.absoluteExpiresAt ?? currentSession.absoluteExpiresAt ?? null,
          warningWindowSeconds:
            payload.session.warningWindowSeconds ?? currentSession.warningWindowSeconds ?? null,
        })
      }

      if (payload.tokens?.accessTokenExpiresAt || payload.tokens?.refreshTokenExpiresAt || payload.serverTime) {
        const currentAccessToken = useAuthSessionStore.getState().accessToken
        if (currentAccessToken) {
          setTokens({
            accessToken: currentAccessToken,
            accessTokenExpiresAt: payload.tokens?.accessTokenExpiresAt ?? undefined,
            refreshTokenExpiresAt: payload.tokens?.refreshTokenExpiresAt ?? undefined,
            serverTime: payload.serverTime,
          })
        }
      }

      return true
    } catch (error) {
      if (isSessionTerminalError(error) || (isApiClientError(error) && error.status === 401)) {
        forceSessionResetToLogin()
      }
      return false
    }
  }, [forceSessionResetToLogin, setSessionContext, setTokens])

  const staySignedIn = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const refreshed = await authService.refresh()

      setTokens({
        accessToken: refreshed.tokens.accessToken,
        accessTokenExpiresAt: refreshed.tokens.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: refreshed.tokens.refreshTokenExpiresAt ?? null,
        serverTime: refreshed.serverTime,
      })

      if (refreshed.session) {
        setSessionContext(authService.mapAuthApiSessionToAppSession(refreshed.session))
      }

      return { success: true }
    } catch (error) {
      if (isSessionTerminalError(error) || (isApiClientError(error) && error.status === 401)) {
        forceSessionResetToLogin()
        return { success: false, message: "Session expired. Please sign in again." }
      }

      return { success: false, message: getApiErrorMessage(error, "Unable to extend session right now.") }
    }
  }, [forceSessionResetToLogin, setSessionContext, setTokens])

  const applyTenantSwitch = useCallback(
    async (tenantId: string, fallbackSession?: AuthSessionContext | null): Promise<boolean> => {
      try {
        const payload = await authService.switchTenant(tenantId)
        setTokens({
          accessToken: payload.accessToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: payload.refreshTokenExpiresAt ?? null,
          serverTime: payload.serverTime,
        })

        if (payload.session) {
          setSessionContext(authService.mapAuthApiSessionToAppSession(payload.session))
        } else {
          const current = fallbackSession ?? useAuthSessionStore.getState().session
          if (current) {
            const activeTenantRole =
              current.memberships.find((membership) => membership.tenantId === tenantId)?.tenantRole ??
              null

            setSessionContext({
              ...current,
              activeTenantId: tenantId,
              activeTenantRole: activeTenantRole as TenantRole | null,
            })
          }
        }

        return true
      } catch {
        return false
      }
    },
    [setSessionContext, setTokens]
  )

  const completeAuth = useCallback(
    async (payload: LoginPayload, redirectTo = "/my-summary") => {
      const mappedUser = authService.mapAuthApiUserToAppUser(payload.user)
      const mappedSession = authService.mapAuthApiSessionToAppSession(payload.session)
      clearPendingMfaRequest()
      consumeMfaReturnPath()
      deactivateMfaGate()

      setSession({
        user: mappedUser,
        session: mappedSession,
        accessToken: payload.tokens.accessToken,
        accessTokenExpiresAt: payload.tokens.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: payload.tokens.refreshTokenExpiresAt ?? null,
        serverTime: payload.serverTime,
        permissions: null,
      })

      if (shouldRouteToPendingApproval(mappedSession)) {
        router.push("/pending-approval")
        return
      }

      if (!mappedSession.activeTenantId) {
        const preferredTenantId = getPreferredTenantId(mappedSession)
        if (preferredTenantId) {
          await applyTenantSwitch(preferredTenantId, mappedSession)
        }
      }

      try {
        const [profile, rolePermissions] = await Promise.all([
          authService.getMeProfile(),
          authService.getPermissions(),
        ])

        setUser(authService.mapMeProfileToAppUser(profile))
        setPermissions(rolePermissions)
      } catch {
        // Fall back to login payload + role defaults if profile hydration fails.
        setPermissions(ROLE_PERMISSIONS[mappedUser.role])
      }

      const hasPending = await refreshAcknowledgementsGate()
      router.push(hasPending ? "/acknowledgements" : redirectTo)
    },
    [
      applyTenantSwitch,
      deactivateMfaGate,
      refreshAcknowledgementsGate,
      router,
      setPermissions,
      setSession,
      setUser,
    ]
  )

  useEffect(() => {
    if (!hasHydrated || hasBootstrapped.current) {
      return
    }

    let isCancelled = false

    const bootstrap = async () => {
      // Read tokens directly from store to avoid stale closure values
      const storeState = useAuthSessionStore.getState()

      // Fast path: if the session has been idle longer than the client-side
      // max-age, skip all network calls and go straight to login.
      if (storeState.isSessionExpired()) {
        clearSession()
        setIsLoading(false)
        return
      }

      hasBootstrapped.current = true
      setIsLoading(true)

      // Refresh tokens once on boot to sync MFA state from backend.
      // Existing users may have stale JWTs with outdated mfaRequired/mfaVerified.
      try {
        const refreshed = await authService.refresh()
        if (isCancelled) return

        setTokens({
          accessToken: refreshed.tokens.accessToken,
          accessTokenExpiresAt: refreshed.tokens.accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: refreshed.tokens.refreshTokenExpiresAt ?? null,
          serverTime: refreshed.serverTime,
        })

        if (refreshed.user) {
          setUser(authService.mapAuthApiUserToAppUser(refreshed.user))
        }

        if (refreshed.session) {
          setSessionContext(authService.mapAuthApiSessionToAppSession(refreshed.session))
        }
      } catch (error) {
        if (isSessionTerminalError(error)) {
          if (storeState.user || storeState.session) {
            forceSessionResetToLogin()
          } else {
            clearSession()
            setIsLoading(false)
          }
          return
        }
        if (storeState.user || storeState.session) {
          clearSession()
        }
        setIsLoading(false)
        return
      }

      try {
        const currentSession = useAuthSessionStore.getState().session
        if (currentSession && !currentSession.activeTenantId && currentSession.memberships.length > 0) {
          const preferredTenantId = getPreferredTenantId(currentSession)
          if (preferredTenantId) {
            await applyTenantSwitch(preferredTenantId, currentSession)
          }
        }

        const [profile, rolePermissions] = await Promise.all([
          authService.getMeProfile(),
          authService.getPermissions(),
        ])

        if (isCancelled) return

        setUser(authService.mapMeProfileToAppUser(profile))
        setPermissions(rolePermissions)
        await refreshAcknowledgementsGate()
      } catch (error) {
        if (!isCancelled) {
          if (isTenantContextError(error)) {
            setPermissions(null)
          } else {
            clearSession()
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isCancelled = true
    }
  // Bootstrap runs once after hydration — reads tokens from store directly
  // rather than depending on accessToken (which would cause an infinite loop
  // since refresh updates the token, re-triggering this effect).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, refreshAcknowledgementsGate])

  useEffect(() => {
    if (!hasHydrated || isLoading) {
      return
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
    const isMfaRoute = pathname.startsWith("/mfa-verify")
    const isPendingApprovalRoute = pathname.startsWith("/pending-approval")
    const isAcknowledgementsRoute = pathname.startsWith("/acknowledgements")
    const pendingApproval = shouldRouteToPendingApproval(session)

    if (!user && isMfaRoute) {
      router.replace("/login")
      return
    }

    if (!user && !isPublicRoute && pathname !== "/") {
      router.replace("/login")
      return
    }

    if (user && pendingApproval && !isPendingApprovalRoute) {
      router.replace("/pending-approval")
      return
    }

    if (user && isPendingApprovalRoute && !pendingApproval) {
      router.replace("/my-summary")
      return
    }

    if (
      user &&
      !pendingApproval &&
      hasPendingAcknowledgements &&
      !isAcknowledgementsRoute &&
      !isCheckingAcknowledgements
    ) {
      router.replace("/acknowledgements")
      return
    }

    if (
      user &&
      isAcknowledgementsRoute &&
      !pendingApproval &&
      !hasPendingAcknowledgements &&
      !isCheckingAcknowledgements
    ) {
      router.replace("/my-summary")
      return
    }

    // Redirect authenticated users away from MFA page to dashboard
    // (MFA is now handled via in-dashboard modal, not a separate page)
    if (user && isMfaRoute) {
      if (pendingApproval) {
        router.replace("/pending-approval")
      } else if (hasPendingAcknowledgements) {
        router.replace("/acknowledgements")
      } else {
        router.replace("/my-summary")
      }
      return
    }

    if (user && isPublicRoute && !isMfaRoute) {
      if (pendingApproval) {
        router.replace("/pending-approval")
      } else if (hasPendingAcknowledgements) {
        router.replace("/acknowledgements")
      } else {
        router.replace("/my-summary")
      }
    }
  }, [
    hasHydrated,
    hasPendingAcknowledgements,
    isCheckingAcknowledgements,
    isLoading,
    pathname,
    router,
    session,
    user,
  ])

  useEffect(() => {
    if (!hasHydrated || isLoading) {
      return
    }

    if (needsMfa && !mfaGateActive) {
      activateMfaGate()
      return
    }

    if (!needsMfa && mfaGateActive) {
      deactivateMfaGate()
    }
  }, [activateMfaGate, deactivateMfaGate, hasHydrated, isLoading, mfaGateActive, needsMfa])

  useEffect(() => {
    if (!user || !accessTokenExpiresAt) {
      return
    }

    const accessExpiresAtMs = Date.parse(accessTokenExpiresAt)
    if (Number.isNaN(accessExpiresAtMs)) {
      return
    }

    const refreshLeadMs = 60_000
    const nowServerMs = Date.now() + serverTimeOffsetMs
    const delayMs = Math.max(accessExpiresAtMs - nowServerMs - refreshLeadMs, 5_000)

    const timer = window.setTimeout(() => {
      void staySignedIn()
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [accessTokenExpiresAt, serverTimeOffsetMs, staySignedIn, user])

  useEffect(() => {
    if (!user) {
      return
    }

    lastSessionSyncAtRef.current = Date.now()
    void syncSessionExpiry()
  }, [syncSessionExpiry, user])

  useEffect(() => {
    if (!user) {
      return
    }

    const interval = window.setInterval(() => {
      lastSessionSyncAtRef.current = Date.now()
      void syncSessionExpiry()
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [syncSessionExpiry, user])

  useEffect(() => {
    if (!user) {
      return
    }

    const idleMs = session?.idleExpiresAt ? Date.parse(session.idleExpiresAt) : Number.NaN
    const absoluteMs = session?.absoluteExpiresAt ? Date.parse(session.absoluteExpiresAt) : Number.NaN
    const candidateExpiry = [idleMs, absoluteMs].filter(Number.isFinite)

    if (candidateExpiry.length === 0) {
      return
    }

    const signOutAtMs = Math.min(...candidateExpiry)
    const nowServerMs = Date.now() + serverTimeOffsetMs
    const delayMs = Math.max(signOutAtMs - nowServerMs + 250, 1_000)

    const timer = window.setTimeout(() => {
      lastSessionSyncAtRef.current = Date.now()
      void syncSessionExpiry()
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [
    serverTimeOffsetMs,
    session?.absoluteExpiresAt,
    session?.idleExpiresAt,
    syncSessionExpiry,
    user,
  ])

  useEffect(() => {
    if (!user) {
      return
    }

    const maybeSyncOnActivity = () => {
      const now = Date.now()
      if (now - lastSessionSyncAtRef.current < 30_000) {
        return
      }

      lastSessionSyncAtRef.current = now
      void syncSessionExpiry()
    }

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "focus"]
    events.forEach((eventName) => {
      window.addEventListener(eventName, maybeSyncOnActivity, { passive: true })
    })

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, maybeSyncOnActivity)
      })
    }
  }, [syncSessionExpiry, user])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      setIsLoading(true)

      try {
        const payload = await authService.login(email, password)
        const requiresMfa = Boolean(payload.session?.mfaRequired && !payload.session?.mfaVerified)
        await completeAuth(payload)
        return { success: true, requiresMfa }
      } catch (error) {
        logApiError(error, "login")

        if (
          isApiClientError(error) &&
          error.status === 403 &&
          error.code === "EMAIL_NOT_VERIFIED"
        ) {
          return {
            success: false,
            message: "Email not verified. Enter the OTP to continue.",
            requiresVerification: true,
          }
        }

        return {
          success: false,
          message: getPublicAuthErrorMessage(error, "Login failed. Please check your credentials."),
        }
      } finally {
        setIsLoading(false)
      }
    },
    [completeAuth]
  )

  const switchTenant = useCallback(
    async (tenantId: string): Promise<{ success: boolean; message?: string }> => {
      const switched = await applyTenantSwitch(tenantId)
      if (!switched) {
        return { success: false, message: "Unable to switch tenant. Please try again." }
      }

      // Mandatory: re-fetch permissions after tenant switch (they are tenant-aware)
      try {
        const rolePermissions = await authService.getPermissions()
        setPermissions(rolePermissions)
      } catch {
        setPermissions(null)
      }

      await refreshAcknowledgementsGate()
      router.refresh()
      return { success: true }
    },
    [applyTenantSwitch, refreshAcknowledgementsGate, router, setPermissions]
  )

  const challengeMfa = useCallback(async (): Promise<{ success: boolean; message?: string; code?: string }> => {
    try {
      const payload = await authService.challengeMfa()
      return { success: true, message: payload.message }
    } catch (error) {
      logApiError(error, "mfa-challenge")

      // Surface the error code so callers can handle MFA_NOT_REQUIRED
      const code = isApiClientError(error) ? error.code : undefined
      return {
        success: false,
        message: getApiErrorMessage(error, "Unable to request MFA challenge."),
        code,
      }
    }
  }, [])

  const verifyMfa = useCallback(
    async (code: string): Promise<{ success: boolean; message?: string; redirectTo?: string }> => {
      try {
        const payload = await authService.verifyMfa(code)
        setTokens({
          accessToken: payload.accessToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt ?? null,
          refreshTokenExpiresAt: payload.refreshTokenExpiresAt ?? null,
          serverTime: payload.serverTime,
        })

        if (payload.session) {
          setSessionContext(authService.mapAuthApiSessionToAppSession(payload.session))
        } else {
          const current = useAuthSessionStore.getState().session
          if (current) {
            setSessionContext({
              ...current,
              mfaVerified: true,
            })
          }
        }

        // Re-fetch permissions to keep state in sync after MFA verify
        try {
          const rolePermissions = await authService.getPermissions()
          setPermissions(rolePermissions)
        } catch {
          // Non-critical — permissions will sync on next page load
        }

        await retryPendingMfaRequest()

        return {
          success: true,
          redirectTo: consumeMfaReturnPath() ?? "/my-summary",
        }
      } catch (error) {
        logApiError(error, "mfa-verify")

        // If BE says MFA is not required, treat as success — sync session and continue
        if (isApiClientError(error) && error.code === "MFA_NOT_REQUIRED") {
          const current = useAuthSessionStore.getState().session
          if (current) {
            setSessionContext({ ...current, mfaRequired: false })
          }
          return { success: true, redirectTo: consumeMfaReturnPath() ?? "/my-summary" }
        }

        return {
          success: false,
          message: getApiErrorMessage(error, "MFA verification failed."),
        }
      }
    },
    [setPermissions, setSessionContext, setTokens]
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // We still clear local session if remote logout fails.
    } finally {
      forceSessionResetToLogin()
    }
  }, [forceSessionResetToLogin])

  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      // /me/permissions (from API) is the single source of truth
      if (permissions) {
        return permissions[permission]
      }

      if (!user) {
        return false
      }

      // Fallback: tenant_admin gets admin-level permissions even if global role is staff
      if (session?.activeTenantRole === "tenant_admin") {
        return ROLE_PERMISSIONS.admin[permission]
      }

      return ROLE_PERMISSIONS[user.role][permission]
    },
    [permissions, session?.activeTenantRole, user]
  )

  const isRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false

      if (Array.isArray(role)) {
        return role.includes(user.role)
      }

      return user.role === role
    },
    [user]
  )

  const getRoleDisplay = useCallback((): string => {
    if (!user) return ""
    // Prefer tenant role display over global user role
    if (session?.activeTenantRole) {
      return TENANT_ROLE_DISPLAY[session.activeTenantRole]
    }
    return GLOBAL_ROLE_DISPLAY[user.role]
  }, [user, session?.activeTenantRole])

  const sessionExpiry: SessionExpiryState = {
    idleExpiresAt: session?.idleExpiresAt ?? null,
    absoluteExpiresAt: session?.absoluteExpiresAt ?? null,
    warningWindowSeconds: session?.warningWindowSeconds ?? 300,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: Boolean(user),
        permissions,
        hasPendingAcknowledgements,
        pendingAcknowledgementItems,
        sessionExpiry,
        serverTimeOffsetMs,
        syncSessionExpiry,
        staySignedIn,
        login,
        completeAuth,
        refreshAcknowledgementsGate,
        switchTenant,
        challengeMfa,
        verifyMfa,
        logout,
        hasPermission,
        isRole,
        getRoleDisplay,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export function usePermission(permission: keyof RolePermissions): boolean {
  const { hasPermission, isLoading } = useAuth()
  if (isLoading) return false
  return hasPermission(permission)
}

export function useRole(role: UserRole | UserRole[]): boolean {
  const { isRole, isLoading } = useAuth()
  if (isLoading) return false
  return isRole(role)
}
