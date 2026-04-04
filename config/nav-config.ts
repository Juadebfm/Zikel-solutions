import {
  LayoutDashboard,
  BarChart3,
  Search,
  Users,
  Home,
  UserCircle,
  Briefcase,
  Building2,
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
  { label: "Daily Logs", href: "/daily-logs", icon: FileText },
  { label: "Care Groups", href: "/care-groups", icon: Users },
  { label: "Homes", href: "/homes", icon: Home },
  { label: "Young People", href: "/young-people", icon: UserCircle },
  { label: "Employees", href: "/employees", icon: Briefcase },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  { label: "Safeguarding", href: "/safeguarding", icon: Shield },
  { label: "Scheduling", href: "/scheduling", icon: Calendar },
  { label: "Documents", href: "/documents", icon: FolderOpen, permission: "canManageSettings" },
  { label: "Reports", href: "/reports", icon: PieChart, permission: "canViewReports" },
  { label: "Form Designer", href: "/forms", icon: ClipboardList, permission: "canManageSettings" },
  { label: "Organisation", href: "/organisation", icon: Building2, permission: "canManageSettings" },
  { label: "Sensitive Data", href: "/sensitive-data", icon: Shield, permission: "canManageSettings" },
  { label: "Users", href: "/users", icon: UserCog, permission: "canManageUsers" },
  {
    label: "Audit",
    href: "/audit",
    icon: ShieldAlert,
    roles: ["admin", "super_admin"],
    permission: "canManageSettings",
  },
  { label: "Settings", href: "/settings", icon: Settings },
]
