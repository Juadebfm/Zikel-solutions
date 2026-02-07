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
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/types"

export interface NavItemConfig {
  label: string
  href: string
  icon: LucideIcon
  /** Which roles can see this item. If empty or undefined, visible to all. */
  roles?: UserRole[]
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
  { label: "Rotas", href: "/rotas", icon: Clock },
  { label: "Bespoke Reporting", href: "/reports", icon: PieChart },
  { label: "Uploads", href: "/uploads", icon: Upload },
  { label: "Sensitive Data", href: "/sensitive-data", icon: Shield },
  { label: "Forms & Procedures", href: "/forms", icon: ClipboardList },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Regions", href: "/regions", icon: MapPin },
  { label: "Users", href: "/users", icon: UserCog },
  { label: "Groupings", href: "/groupings", icon: Layers },
  { label: "Bulk Exports", href: "/bulk-exports", icon: Download },
  { label: "System Settings", href: "/system-settings", icon: Settings },
]
