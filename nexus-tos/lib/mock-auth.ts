import type { AuthUser, User, AuthResponse, UserRole } from "@/types"

/**
 * Mock Authentication Data
 *
 * This file contains mock user credentials for development/testing.
 * In production, this will be replaced with actual backend API calls.
 *
 * Test Accounts:
 * 1. Admin:   izuObani@zekel.com / superadmin
 * 2. Manager: juadebgabriel@gmail.com / manageracc
 * 3. Staff:   zekelstaff@zekel.com / teststaff
 */

// Mock users database (passwords stored here for mock purposes only)
const mockAuthUsers: AuthUser[] = [
  {
    id: "user-admin-001",
    email: "izuObani@zekel.com",
    password: "superadmin",
    firstName: "Izu",
    lastName: "Obani",
    role: "admin",
    jobTitle: "System Administrator",
    phone: "07700 900000",
    createdAt: "2023-01-01T09:00:00Z",
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: "user-manager-001",
    email: "juadebgabriel@gmail.com",
    password: "manageracc",
    firstName: "Juadeb",
    lastName: "Gabriel",
    role: "manager",
    homeId: "home-1",
    homeName: "Maple House",
    jobTitle: "Home Manager",
    phone: "07700 900001",
    createdAt: "2023-03-15T09:00:00Z",
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: "user-staff-001",
    email: "zekelstaff@zekel.com",
    password: "teststaff",
    firstName: "Test",
    lastName: "Staff",
    role: "staff",
    homeId: "home-1",
    homeName: "Maple House",
    jobTitle: "Care Worker",
    phone: "07700 900002",
    createdAt: "2023-06-01T09:00:00Z",
    lastLoginAt: new Date().toISOString(),
  },
]

/**
 * Simulate API delay for realistic behavior
 */
const simulateApiDelay = (ms: number = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Authenticate user with email and password
 * Returns user data (without password) on success
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  await simulateApiDelay()

  // Find user by email (case-insensitive)
  const authUser = mockAuthUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  )

  if (!authUser) {
    return {
      success: false,
      message: "No account found with this email address.",
    }
  }

  if (authUser.password !== password) {
    return {
      success: false,
      message: "Incorrect password. Please try again.",
    }
  }

  // Remove password before returning user data
  const { password: _, ...userWithoutPassword } = authUser
  const user: User = {
    ...userWithoutPassword,
    lastLoginAt: new Date().toISOString(),
  }

  return {
    success: true,
    user,
    token: `mock-jwt-token-${user.id}-${Date.now()}`, // Mock JWT token
    message: "Login successful",
  }
}

/**
 * Get user by ID (for session restoration)
 */
export async function getUserById(userId: string): Promise<User | null> {
  await simulateApiDelay(300)

  const authUser = mockAuthUsers.find((u) => u.id === userId)
  if (!authUser) return null

  const { password: _, ...userWithoutPassword } = authUser
  return userWithoutPassword
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  await simulateApiDelay(300)

  const authUser = mockAuthUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  )
  if (!authUser) return null

  const { password: _, ...userWithoutPassword } = authUser
  return userWithoutPassword
}

/**
 * Check if email exists (for registration/forgot password)
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  await simulateApiDelay(300)

  return mockAuthUsers.some(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  )
}

/**
 * Validate password reset token (mock)
 */
export async function validateResetToken(token: string): Promise<boolean> {
  await simulateApiDelay(300)
  // In production, validate against actual token
  return token.startsWith("reset-")
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Manager",
    staff: "Staff Member",
  }
  return roleNames[role]
}

/**
 * Get all mock users (for development/testing only)
 * Never expose passwords - this is just for listing users
 */
export function getAllMockUsers(): Omit<AuthUser, "password">[] {
  return mockAuthUsers.map(({ password: _, ...user }) => user)
}
