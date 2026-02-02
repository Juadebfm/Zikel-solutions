import type { ReactNode } from "react"

// Language Types
export type Language = "en" | "fr"

// Select Option Types
export interface SelectOption<T = string> {
  value: T
  label: string
  icon?: ReactNode
  disabled?: boolean
}

// Country Data Types
export interface CountryOption {
  code: string
  name: string
  flag: string
  phoneCode: string
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

// Form Step Types
export interface FormStep {
  id: number
  title: string
  description?: string
}

// Status Badge Types
export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"

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
