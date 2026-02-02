"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
  HelpCircle,
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  adminOnly?: boolean
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: "WORKSPACE",
    items: [
      { label: "My Summary", href: "/my-summary", icon: LayoutDashboard },
      { label: "My Dashboard", href: "/my-dashboard", icon: BarChart3 },
      { label: "Task Explorer", href: "/tasks", icon: Search },
    ],
  },
  {
    title: "DIRECTORY",
    items: [
      { label: "Care Groups", href: "/care-groups", icon: Users },
      { label: "Homes", href: "/homes", icon: Home },
      { label: "Young People", href: "/young-people", icon: UserCircle },
      { label: "Employees", href: "/employees", icon: Briefcase },
      { label: "Vehicles", href: "/vehicles", icon: Car },
    ],
  },
  {
    title: "SCHEDULING",
    items: [
      { label: "Calendar", href: "/calendar", icon: Calendar },
      { label: "Daily Logs", href: "/daily-logs", icon: FileText },
      { label: "Rotas", href: "/rotas", icon: Clock },
    ],
  },
  {
    title: "REPORTS",
    items: [
      { label: "Bespoke Reporting", href: "/reports", icon: PieChart },
      { label: "Uploads", href: "/uploads", icon: Upload },
    ],
  },
  {
    title: "LIBRARY",
    items: [
      { label: "Sensitive Data", href: "/sensitive-data", icon: Shield },
      { label: "Forms & Procedures", href: "/forms", icon: ClipboardList },
      { label: "Documents", href: "/documents", icon: FolderOpen },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "Regions", href: "/regions", icon: MapPin, adminOnly: true },
      { label: "Users", href: "/users", icon: UserCog, adminOnly: true },
      { label: "Groupings", href: "/groupings", icon: Layers, adminOnly: true },
      { label: "Bulk Exports", href: "/bulk-exports", icon: Download, adminOnly: true },
      { label: "System Settings", href: "/system-settings", icon: Settings, adminOnly: true },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, hasPermission } = useAuth()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  // Filter admin-only items based on permissions
  const filterNavItems = (items: NavItem[]) => {
    return items.filter((item) => {
      if (item.adminOnly) {
        return hasPermission("canManageSettings")
      }
      return true
    })
  }

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/my-summary" className="flex items-center gap-3">
          <Image
            src="/favicon.png"
            alt="Zikel Solutions"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="text-xl font-bold text-sidebar-foreground">
            Zikel Solutions
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3">
          {navigationSections.map((section, sectionIndex) => {
            const filteredItems = filterNavItems(section.items)
            if (filteredItems.length === 0) return null

            return (
              <div key={sectionIndex} className="mb-6">
                {section.title && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border">
        {/* Help Link */}
        <nav className="px-3 py-2">
          <Link
            href="/help"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/help"
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <HelpCircle className="h-5 w-5 flex-shrink-0" />
            <span>Help Centre</span>
          </Link>
        </nav>

        {/* System Status */}
        <div className="px-6 py-2 text-xs text-sidebar-foreground/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>System status</span>
          </div>
          <p className="mt-1 font-medium text-sidebar-foreground/70">v1.0.0 Stable</p>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user ? getInitials(user.firstName, user.lastName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.role === "admin"
                      ? "Administrator"
                      : user?.role === "manager"
                        ? "Manager"
                        : "Staff"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/system-settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help Centre
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}
