"use client"

import {
  createContext,
  useContext,
  useEffect,
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
import type { AuthSessionContext, RolePermissions, TenantRole, UserRole } from "@/types"
import { ROLE_PERMISSIONS } from "@/types"
import { useMfaStore } from "@/stores/mfa-store"

interface LoginResult {
  success: boolean
  message?: string
  requiresVerification?: boolean
  requiresMfa?: boolean
}

interface AuthContextType {
  user: ReturnType<typeof useAuthSessionStore.getState>["user"]
  session: AuthSessionContext | null
  isLoading: boolean
  isAuthenticated: boolean
  permissions: RolePermissions | null
  login: (email: string, password: string) => Promise<LoginResult>
  completeAuth: (payload: LoginPayload, redirectTo?: string) => Promise<void>
  switchTenant: (tenantId: string) => Promise<{ success: boolean; message?: string }>
  challengeMfa: () => Promise<{ success: boolean; message?: string }>
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const user = useAuthSessionStore((state) => state.user)
  const session = useAuthSessionStore((state) => state.session)
  const permissions = useAuthSessionStore((state) => state.permissions)
  const accessToken = useAuthSessionStore((state) => state.accessToken)
  const refreshToken = useAuthSessionStore((state) => state.refreshToken)
  const hasHydrated = useAuthSessionStore((state) => state.hasHydrated)
  const setSession = useAuthSessionStore((state) => state.setSession)
  const setSessionContext = useAuthSessionStore((state) => state.setSessionContext)
  const setUser = useAuthSessionStore((state) => state.setUser)
  const setTokens = useAuthSessionStore((state) => state.setTokens)
  const setPermissions = useAuthSessionStore((state) => state.setPermissions)
  const clearSession = useAuthSessionStore((state) => state.clearSession)

  const [isLoading, setIsLoading] = useState(true)

  const applyTenantSwitch = useCallback(
    async (tenantId: string, fallbackSession?: AuthSessionContext | null): Promise<boolean> => {
      try {
        const payload = await authService.switchTenant(tenantId)
        setTokens({ accessToken: payload.accessToken })

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

      setSession({
        user: mappedUser,
        session: mappedSession,
        accessToken: payload.tokens.accessToken,
        refreshToken: payload.tokens.refreshToken ?? null,
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

      router.push(redirectTo)
    },
    [applyTenantSwitch, router, setPermissions, setSession, setUser]
  )

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    let isCancelled = false

    const bootstrap = async () => {
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

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
  }, [accessToken, applyTenantSwitch, clearSession, hasHydrated, setPermissions, setUser])

  useEffect(() => {
    if (!hasHydrated || isLoading) {
      return
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
    const isMfaRoute = pathname.startsWith("/mfa-verify")
    const isPendingApprovalRoute = pathname.startsWith("/pending-approval")
    const pendingApproval = shouldRouteToPendingApproval(session)

    if (!user && isMfaRoute) {
      router.replace("/login")
      return
    }

    if (!user && !isPublicRoute && pathname !== "/") {
      router.replace("/login")
      return
    }

    // MFA pending users are allowed into the dashboard (read-only).
    // The MFA banner and modal handle the UX for completing MFA.

    if (user && pendingApproval && !isPendingApprovalRoute) {
      router.replace("/pending-approval")
      return
    }

    if (user && isPendingApprovalRoute && !pendingApproval) {
      router.replace("/my-summary")
      return
    }

    // Redirect authenticated users away from MFA page to dashboard
    // (MFA is now handled via in-dashboard modal, not a separate page)
    if (user && isMfaRoute) {
      router.replace(pendingApproval ? "/pending-approval" : "/my-summary")
      return
    }

    if (user && isPublicRoute && !isMfaRoute) {
      router.replace(pendingApproval ? "/pending-approval" : "/my-summary")
    }
  }, [hasHydrated, isLoading, pathname, router, session, user])

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

      router.refresh()
      return { success: true }
    },
    [applyTenantSwitch, router, setPermissions]
  )

  const challengeMfa = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const payload = await authService.challengeMfa()
      return { success: true, message: payload.message }
    } catch (error) {
      logApiError(error, "mfa-challenge")
      return {
        success: false,
        message: getApiErrorMessage(error, "Unable to request MFA challenge."),
      }
    }
  }, [])

  const verifyMfa = useCallback(
    async (code: string): Promise<{ success: boolean; message?: string; redirectTo?: string }> => {
      try {
        const payload = await authService.verifyMfa(code)
        setTokens({ accessToken: payload.accessToken })

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

        // Reset MFA banner dismissed state so it hides naturally
        useMfaStore.getState().dismissBanner()

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
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // We still clear local session if remote logout fails.
    } finally {
      clearPendingMfaRequest()
      consumeMfaReturnPath()
      clearSession()
      router.push("/login")
    }
  }, [clearSession, refreshToken, router])

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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: Boolean(user),
        permissions,
        login,
        completeAuth,
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
