import type {
  AuthUser,
  User,
  AuthResponse,
  UserRole,
  SignupFormData,
  OTPVerificationResponse,
} from "@/types"

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

// In-memory OTP storage (for mock purposes)
interface OTPEntry {
  code: string
  email: string
  expiresAt: number
  signupData?: SignupFormData
}

const otpStore = new Map<string, OTPEntry>()

/**
 * Simulate API delay for realistic behavior
 */
const simulateApiDelay = (ms: number = 0): Promise<void> => {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a 6-digit OTP code
 * In development, always returns "123456" for easy testing
 * In production, this would generate a random code
 */
function generateOTP(): string {
  // Fixed OTP for development/testing - always "123456"
  return "123456"
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
 * Initiate signup process
 * Creates pending registration and sends OTP
 */
export async function initiateSignup(data: SignupFormData): Promise<AuthResponse> {
  await simulateApiDelay()

  // Check if email already exists
  const emailExists = mockAuthUsers.some(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  )

  if (emailExists) {
    return {
      success: false,
      message: "An account with this email already exists.",
    }
  }

  // Generate OTP and store with signup data
  const otp = generateOTP()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  otpStore.set(data.email.toLowerCase(), {
    code: otp,
    email: data.email,
    expiresAt,
    signupData: data,
  })

  // In production, this would send an email
  console.log(`[MOCK] OTP for ${data.email}: ${otp}`)

  return {
    success: true,
    message: "Verification code sent to your email.",
  }
}

/**
 * Verify OTP code and complete registration
 */
export async function verifyOTP(
  email: string,
  code: string
): Promise<OTPVerificationResponse> {
  await simulateApiDelay()

  const entry = otpStore.get(email.toLowerCase())

  if (!entry) {
    return {
      success: false,
      message: "No verification code found. Please request a new one.",
    }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase())
    return {
      success: false,
      message: "Verification code has expired. Please request a new one.",
    }
  }

  if (entry.code !== code) {
    return {
      success: false,
      message: "Invalid verification code. Please try again.",
    }
  }

  // OTP is valid - create the user account
  if (entry.signupData) {
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: entry.signupData.email,
      password: entry.signupData.password,
      firstName: entry.signupData.firstName,
      lastName: entry.signupData.surname,
      role: "staff" as UserRole, // New users start as staff
      phone: `${entry.signupData.phoneCountryCode}${entry.signupData.phone}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    mockAuthUsers.push(newUser)
    console.log(`[MOCK] User created: ${newUser.email}`)
  }

  // Clear the OTP
  otpStore.delete(email.toLowerCase())

  return {
    success: true,
    message: "Email verified successfully. You can now log in.",
  }
}

/**
 * Resend OTP code
 */
export async function resendOTP(
  email: string
): Promise<{ success: boolean; message?: string }> {
  await simulateApiDelay()

  const existingEntry = otpStore.get(email.toLowerCase())

  if (!existingEntry) {
    return {
      success: false,
      message: "No pending verification found. Please start registration again.",
    }
  }

  // Generate new OTP
  const newOtp = generateOTP()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  otpStore.set(email.toLowerCase(), {
    ...existingEntry,
    code: newOtp,
    expiresAt,
  })

  // In production, this would send an email
  console.log(`[MOCK] New OTP for ${email}: ${newOtp}`)

  return {
    success: true,
    message: "A new verification code has been sent to your email.",
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

/**
 * Get pending OTP for testing (DEV ONLY)
 */
export function getOTPForTesting(email: string): string | null {
  const entry = otpStore.get(email.toLowerCase())
  return entry?.code ?? null
}
