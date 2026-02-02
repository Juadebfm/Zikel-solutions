// User Roles and Permissions
export type UserRole = "staff" | "manager" | "admin"

export interface RolePermissions {
  canViewAllHomes: boolean
  canViewAllYoungPeople: boolean
  canViewAllEmployees: boolean
  canApproveIOILogs: boolean
  canManageUsers: boolean
  canManageSettings: boolean
  canViewReports: boolean
  canExportData: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  staff: {
    canViewAllHomes: false,
    canViewAllYoungPeople: false,
    canViewAllEmployees: false,
    canApproveIOILogs: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: false,
    canExportData: false,
  },
  manager: {
    canViewAllHomes: true,
    canViewAllYoungPeople: true,
    canViewAllEmployees: true,
    canApproveIOILogs: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewReports: true,
    canExportData: true,
  },
  admin: {
    canViewAllHomes: true,
    canViewAllYoungPeople: true,
    canViewAllEmployees: true,
    canApproveIOILogs: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewReports: true,
    canExportData: true,
  },
}

// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  homeId?: string
  homeName?: string
  phone?: string
  jobTitle?: string
  createdAt: string
  lastLoginAt?: string
}

// Auth Types (for mock authentication)
export interface AuthUser extends User {
  password: string // Only used in mock data, never exposed to client
}

export interface AuthResponse {
  success: boolean
  user?: User
  message?: string
  token?: string // For future JWT implementation
}

// Login Form Data
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

// Signup Types
export type SupportedCountry = "UK" | "Nigeria"

export type Gender = "male" | "female" | "other" | "prefer-not-to-say"

export interface SignupFormData {
  country: SupportedCountry
  firstName: string
  middleName?: string
  surname: string
  gender: Gender
  email: string
  phone: string
  phoneCountryCode: string
  password: string
}

export interface SignupStepData {
  step1: {
    country: SupportedCountry | null
  }
  step2: {
    firstName: string
    middleName: string
    surname: string
    gender: Gender | null
    email: string
    phone: string
    phoneCountryCode: string
  }
  step3: {
    password: string
    confirmPassword: string
    acceptTerms: boolean
    acceptMarketing: boolean
  }
  step4: {
    verificationCode: string
  }
}

// OTP Types
export interface OTPVerificationRequest {
  email: string
  code: string
}

export interface OTPVerificationResponse {
  success: boolean
  message?: string
}

// Password Requirement Type
export interface PasswordRequirement {
  key: string
  label: string
  test: (password: string) => boolean
}

// Session Storage Type
export interface StoredAuth {
  user: User
  token: string
  expiresAt: number
}
