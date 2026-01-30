"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User, UserRole, RolePermissions } from "@/types"
import { ROLE_PERMISSIONS } from "@/types"
import { authenticateUser, getRoleDisplayName } from "@/lib/mock-auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  permissions: RolePermissions | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  hasPermission: (permission: keyof RolePermissions) => boolean
  isRole: (role: UserRole | UserRole[]) => boolean
  getRoleDisplay: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"]
const STORAGE_KEY = "nexus-auth"

interface StoredAuth {
  user: User
  token: string
  expiresAt: number
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Get permissions based on user role
  const permissions = user ? ROLE_PERMISSIONS[user.role] : null

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const auth: StoredAuth = JSON.parse(stored)

          // Check if session is expired (24 hours)
          if (auth.expiresAt > Date.now()) {
            setUser(auth.user)
          } else {
            // Session expired, clear storage
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Redirect logic based on auth state
  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    if (!user && !isPublicRoute && pathname !== "/") {
      router.push("/login")
    } else if (user && isPublicRoute) {
      router.push("/my-summary")
    }
  }, [user, isLoading, pathname, router])

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; message?: string }> => {
      setIsLoading(true)
      try {
        const response = await authenticateUser(email, password)

        if (response.success && response.user) {
          setUser(response.user)

          // Store auth data with 24-hour expiration
          const authData: StoredAuth = {
            user: response.user,
            token: response.token || "",
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))

          router.push("/my-summary")
          return { success: true }
        }

        return {
          success: false,
          message: response.message || "Login failed. Please try again.",
        }
      } catch {
        return {
          success: false,
          message: "An error occurred. Please try again.",
        }
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.push("/login")
  }, [router])

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: keyof RolePermissions): boolean => {
      if (!permissions) return false
      return permissions[permission]
    },
    [permissions]
  )

  // Check if user has a specific role
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

  // Get display name for user's role
  const getRoleDisplay = useCallback((): string => {
    if (!user) return ""
    return getRoleDisplayName(user.role)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        permissions,
        login,
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

/**
 * Hook to check permissions - returns false during loading
 * Useful for conditional rendering
 */
export function usePermission(permission: keyof RolePermissions): boolean {
  const { hasPermission, isLoading } = useAuth()
  if (isLoading) return false
  return hasPermission(permission)
}

/**
 * Hook to check role - returns false during loading
 * Useful for conditional rendering
 */
export function useRole(role: UserRole | UserRole[]): boolean {
  const { isRole, isLoading } = useAuth()
  if (isLoading) return false
  return isRole(role)
}
