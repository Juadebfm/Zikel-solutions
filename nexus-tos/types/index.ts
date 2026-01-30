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

// Young Person Types
export interface YoungPerson {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  homeId: string
  homeName: string
  status: "active" | "inactive" | "transferred"
  avatar?: string
  admissionDate: string
  keyWorker?: string
}

// Home Types
export interface Home {
  id: string
  name: string
  address: string
  capacity: number
  currentOccupancy: number
  manager: string
  phone: string
  status: "active" | "inactive"
}

// Care Group Types
export interface CareGroup {
  id: string
  name: string
  description?: string
  homes: string[]
  manager: string
}

// Employee Types
export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  homeId?: string
  homeName?: string
  phone: string
  status: "active" | "inactive" | "on-leave"
  startDate: string
  avatar?: string
}

// Task Types
export type TaskStatus =
  | "overdue"
  | "due-today"
  | "pending"
  | "rejected"
  | "draft"
  | "future"
  | "completed"
  | "comments"
  | "rewards"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  dueDate: string
  assignedTo: string
  assignedToName: string
  youngPersonId?: string
  youngPersonName?: string
  category: string
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

// IOI Log Types
export interface IOILog {
  id: string
  youngPersonId: string
  youngPersonName: string
  authorId: string
  authorName: string
  sessionDate: string
  location?: string
  status: "draft" | "pending" | "approved" | "rejected"
  input: {
    situation: string
    clientState?: string
    goals?: string
  }
  output: {
    intervention: string
    techniques?: string[]
    duration?: number
  }
  impact: {
    immediateImpact: string
    clientResponse?: string
    followUpNeeded: boolean
    notes?: string
  }
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

// Dashboard Stats Types
export interface DashboardStat {
  label: string
  value: number
  color: string
  icon: string
  href: string
}

// Navigation Types
export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

export interface NavSection {
  items: (NavItem | "divider")[]
}

// Calendar Event Types
export interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime?: string
  endTime?: string
  type: "shift" | "appointment" | "training" | "meeting" | "other"
  description?: string
  participants?: string[]
}

// Vehicle Types
export interface Vehicle {
  id: string
  registration: string
  make: string
  model: string
  homeId: string
  homeName: string
  status: "available" | "in-use" | "maintenance"
  mileage: number
  nextServiceDate: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface IOILogFormData {
  youngPersonId: string
  sessionDate: string
  location?: string
  situation: string
  clientState?: string
  goals?: string
  intervention: string
  techniques?: string[]
  duration?: number
  immediateImpact: string
  clientResponse?: string
  followUpNeeded: boolean
  notes?: string
}
