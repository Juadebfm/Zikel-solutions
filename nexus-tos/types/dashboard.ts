import type { UserRole } from "./auth"

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
export type CareGroupType = "private" | "public" | "charity"

export interface CareGroup {
  id: number
  name: string
  type: CareGroupType
  phoneNumber?: string
  email?: string
  faxNumber?: string
  description?: string
  website?: string
  defaultUserIpRestriction: boolean
  homes: string[]
  manager: string
  lastUpdated: string
  lastUpdatedBy: string
  // Contact details
  contact?: string
  // Address
  addressLine1?: string
  addressLine2?: string
  city?: string
  countryRegion?: string
  postcode?: string
  // Settings
  twilioSid?: string
  twilioToken?: string
  twilioPhoneNumber?: string
}

export interface Stakeholder {
  id: number
  name: string
  position: string
  responsibleIndividual: boolean
  startDate: string
  endDate?: string
  userId?: string
}

// Care Group Home (home as viewed within a care group context)
export type CareGroupHomeStatus = "current" | "past" | "planned"

export interface CareGroupHome {
  id: number
  name: string
  status: CareGroupHomeStatus
  category: string
  responsibleIndividual: string
  detailsAvailable: boolean
  careGroupId: number
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

// IOI Log Form Data
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

// Dashboard Stats Types
export interface DashboardStat {
  label: string
  value: number
  color: string
  icon: string
  href: string
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

// Task Explorer Types
export type TaskExplorerPeriod =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "this-week"
  | "this-month"
  | "this-year"
  | "last-month"
  | "all"
  | "custom"

export type TaskExplorerType =
  | "home"
  | "young-person"
  | "vehicle"

export type TaskExplorerStatusOption =
  | "submitted"
  | "draft"
  | "sent-for-approval"
  | "approved"
  | "rejected"
  | "sent-for-deletion"
  | "deleted"
  | "deleted-draft"
  | "hidden"

export interface TaskExplorerFilters {
  period: TaskExplorerPeriod | ""
  type: TaskExplorerType | ""
  project: string
  forms: string[]
  field: string
  keyword: string
  searchByOther: string[]
  taskId: string
  statuses: TaskExplorerStatusOption[]
  showAuditTrail: boolean
}

export interface TaskExplorerForm {
  id: string
  name: string
  category: string
  fields: TaskExplorerFormField[]
  lastUpdated: string
}

export interface TaskExplorerFormField {
  id: string
  label: string
  type: "text" | "select" | "date" | "checkbox" | "number"
  required: boolean
}

export interface TaskExplorerLogEntry {
  id: string
  taskId: number
  title: string
  formGroup: string
  relatesTo: string
  relatesToIcon: "person" | "home"
  homeOrSchool: string
  taskDate: string
  status: TaskExplorerStatusOption
  originallyRecordedAt: string
  originallyRecordedBy: string
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
