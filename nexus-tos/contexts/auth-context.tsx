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
import { useAuthSessionStore } from "@/stores/auth-session-store"
import { authService, type LoginPayload } from "@/services/auth.service"
import type { RolePermissions, UserRole } from "@/types"
import { ROLE_PERMISSIONS } from "@/types"

interface LoginResult {
  success: boolean
  message?: string
  requiresVerification?: boolean
}

interface AuthContextType {
  user: ReturnType<typeof useAuthSessionStore.getState>["user"]
  isLoading: boolean
  isAuthenticated: boolean
  permissions: RolePermissions | null
  login: (email: string, password: string) => Promise<LoginResult>
  completeAuth: (payload: LoginPayload, redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: keyof RolePermissions) => boolean
  isRole: (role: UserRole | UserRole[]) => boolean
  getRoleDisplay: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/verify-email"]

const ROLE_DISPLAY: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const user = useAuthSessionStore((state) => state.user)
  const permissions = useAuthSessionStore((state) => state.permissions)
  const accessToken = useAuthSessionStore((state) => state.accessToken)
  const refreshToken = useAuthSessionStore((state) => state.refreshToken)
  const hasHydrated = useAuthSessionStore((state) => state.hasHydrated)
  const setSession = useAuthSessionStore((state) => state.setSession)
  const setUser = useAuthSessionStore((state) => state.setUser)
  const setPermissions = useAuthSessionStore((state) => state.setPermissions)
  const clearSession = useAuthSessionStore((state) => state.clearSession)

  const [isLoading, setIsLoading] = useState(true)

  const completeAuth = useCallback(
    async (payload: LoginPayload, redirectTo = "/my-summary") => {
      const mappedUser = authService.mapAuthApiUserToAppUser(payload.user)

      setSession({
        user: mappedUser,
        accessToken: payload.tokens.accessToken,
        refreshToken: payload.tokens.refreshToken,
        permissions: null,
      })

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
    [router, setPermissions, setSession, setUser]
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
        const [profile, rolePermissions] = await Promise.all([
          authService.getMeProfile(),
          authService.getPermissions(),
        ])

        if (isCancelled) return

        setUser(authService.mapMeProfileToAppUser(profile))
        setPermissions(rolePermissions)
      } catch {
        if (!isCancelled) {
          clearSession()
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
  }, [accessToken, clearSession, hasHydrated, setPermissions, setUser])

  useEffect(() => {
    if (!hasHydrated || isLoading) {
      return
    }

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

    if (!user && !isPublicRoute && pathname !== "/") {
      router.replace("/login")
      return
    }

    if (user && isPublicRoute) {
      router.replace("/my-summary")
    }
  }, [hasHydrated, isLoading, pathname, router, user])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      setIsLoading(true)

      try {
        const payload = await authService.login(email, password)
        await completeAuth(payload)
        return { success: true }
      } catch (error) {
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
          message: getApiErrorMessage(error, "Login failed. Please check your credentials."),
        }
      } finally {
        setIsLoading(false)
      }
    },
    [completeAuth]
  )

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // We still clear local session if remote logout fails.
    } finally {
      clearSession()
      router.push("/login")
    }
  }, [clearSession, refreshToken, router])

  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (permissions) {
        return permissions[permission]
      }

      if (!user) {
        return false
      }

      return ROLE_PERMISSIONS[user.role][permission]
    },
    [permissions, user]
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
    return ROLE_DISPLAY[user.role]
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        permissions,
        login,
        completeAuth,
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
