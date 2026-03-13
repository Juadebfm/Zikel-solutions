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
  { label: "My Dashboard", href: "/my-dashboard", icon: BarChart3 },
  { label: "Task Explorer", href: "/tasks", icon: Search },
  { label: "Care Groups", href: "/care-groups", icon: Users },
  { label: "Homes", href: "/homes", icon: Home },
  { label: "Young People", href: "/young-people", icon: UserCircle },
  { label: "Employees", href: "/employees", icon: Briefcase },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Daily Logs", href: "/daily-logs", icon: FileText },
  { label: "Rotas", href: "/rotas", icon: Clock, permission: "canManageSettings" },
  { label: "Bespoke Reporting", href: "/reports", icon: PieChart, permission: "canViewReports" },
  { label: "Uploads", href: "/uploads", icon: Upload },
  { label: "Sensitive Data", href: "/sensitive-data", icon: Shield, permission: "canManageSettings" },
  { label: "Forms & Procedures", href: "/forms", icon: ClipboardList, permission: "canManageSettings" },
  { label: "Documents", href: "/documents", icon: FolderOpen, permission: "canManageSettings" },
  { label: "Regions", href: "/regions", icon: MapPin, permission: "canManageSettings" },
  { label: "Users", href: "/users", icon: UserCog, permission: "canManageUsers" },
  {
    label: "Audit",
    href: "/audit",
    icon: ShieldAlert,
    roles: ["admin", "super_admin"],
    permission: "canManageSettings",
  },
  { label: "Groupings", href: "/groupings", icon: Layers, permission: "canManageSettings" },
  { label: "Bulk Exports", href: "/bulk-exports", icon: Download, permission: "canExportData" },
  { label: "System Settings", href: "/system-settings", icon: Settings, permission: "canManageSettings" },
]
