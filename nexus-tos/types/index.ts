// Re-export all types for backward compatibility
// This allows existing imports like `import { User } from "@/types"` to continue working

// Auth types
export type {
  UserRole,
  RolePermissions,
  User,
  AuthUser,
  AuthResponse,
  LoginFormData,
  SupportedCountry,
  Gender,
  SignupFormData,
  SignupStepData,
  OTPVerificationRequest,
  OTPVerificationResponse,
  PasswordRequirement,
  StoredAuth,
} from "./auth"

export { ROLE_PERMISSIONS } from "./auth"

// Common types
export type {
  Language,
  SelectOption,
  CountryOption,
  ApiResponse,
  PaginatedResponse,
  FormStep,
  StatusVariant,
  NavItem,
  NavSection,
} from "./common"

// Dashboard types
export type {
  YoungPerson,
  Home,
  CareGroup,
  Employee,
  TaskStatus,
  Task,
  IOILog,
  IOILogFormData,
  DashboardStat,
  CalendarEvent,
  Vehicle,
} from "./dashboard"

// Legacy type alias for backward compatibility
import type { SignupFormData as _SignupFormData } from "./auth"
export type RegisterFormData = _SignupFormData
