import {
  LayoutDashboard,
  BarChart3,
  Search,
  Users,
  Home,
  UserCircle,
  Briefcase,
  Car,
  Calendar,
  FileText,
  Clock,
  PieChart,
  Upload,
  Shield,
  ClipboardList,
  FolderOpen,
  MapPin,
  UserCog,
  Layers,
  Download,
  Settings,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"
import type { RolePermissions, UserRole } from "@/types"

export interface NavItemConfig {
  label: string
  href: string
  icon: LucideIcon
  /** Which roles can see this item. If empty or undefined, visible to all. */
  roles?: UserRole[]
  /** Permission gate for this nav item. */
  permission?: keyof RolePermissions
  /** Hide from nav until implementation is complete. */
  hidden?: boolean
}

/**
 * Navigation items config.
 *
 * To gate an item to specific roles, add a `roles` array:
 *   { label: "Users", href: "/users", icon: UserCog, roles: ["admin"] }
 *
 * To make an item visible to everyone, omit `roles`:
 *   { label: "My Summary", href: "/my-summary", icon: LayoutDashboard }
 */
export const navItems: NavItemConfig[] = [
  { label: "My Summary", href: "/my-summary", icon: LayoutDashboard },
  // { label: "My Dashboard", href: "/my-dashboard", icon: BarChart3 },
  { label: "Task Explorer", href: "/tasks", icon: Search },
  { label: "Care Groups", href: "/care-groups", icon: Users },
  { label: "Homes", href: "/homes", icon: Home },
  { label: "Young People", href: "/young-people", icon: UserCircle },
  { label: "Employees", href: "/employees", icon: Briefcase },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Calendar", href: "/calendar", icon: Calendar, hidden: true },
  { label: "Daily Logs", href: "/daily-logs", icon: FileText, hidden: true },
  { label: "Rotas", href: "/rotas", icon: Clock, permission: "canManageSettings", hidden: true },
  { label: "Bespoke Reporting", href: "/reports", icon: PieChart, permission: "canViewReports", hidden: true },
  { label: "Uploads", href: "/uploads", icon: Upload, hidden: true },
  { label: "Sensitive Data", href: "/sensitive-data", icon: Shield, permission: "canManageSettings", hidden: true },
  { label: "Form Designer", href: "/forms", icon: ClipboardList, permission: "canManageSettings" },
  { label: "Documents", href: "/documents", icon: FolderOpen, permission: "canManageSettings", hidden: true },
  { label: "Regions", href: "/regions", icon: MapPin, permission: "canManageSettings", hidden: true },
  { label: "Users", href: "/users", icon: UserCog, permission: "canManageUsers" },
  {
    label: "Audit",
    href: "/audit",
    icon: ShieldAlert,
    roles: ["admin", "super_admin"],
    permission: "canManageSettings",
  },
  { label: "Groupings", href: "/groupings", icon: Layers, permission: "canManageSettings", hidden: true },
  { label: "Bulk Exports", href: "/bulk-exports", icon: Download, permission: "canExportData", hidden: true },
  { label: "System Settings", href: "/system-settings", icon: Settings, permission: "canManageSettings", hidden: true },
]
