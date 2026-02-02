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
  HelpCircle,
  LogOut,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  adminOnly?: boolean
}

const mainNavItems: (NavItem | "divider")[] = [
  { label: "My Summary", href: "/my-summary", icon: LayoutDashboard },
  { label: "My Dashboard", href: "/my-dashboard", icon: BarChart3 },
  { label: "Task Explorer", href: "/tasks", icon: Search },
  "divider",
  { label: "Care Groups", href: "/care-groups", icon: Users },
  { label: "Homes", href: "/homes", icon: Home },
  { label: "Young People", href: "/young-people", icon: UserCircle },
  { label: "Employees", href: "/employees", icon: Briefcase },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  "divider",
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Daily Logs", href: "/daily-logs", icon: FileText },
  { label: "Rotas", href: "/rotas", icon: Clock },
  "divider",
  { label: "Bespoke Reporting", href: "/reports", icon: PieChart },
  { label: "Uploads", href: "/uploads", icon: Upload },
  "divider",
  { label: "Sensitive Data", href: "/sensitive-data", icon: Shield },
  { label: "Forms & Procedures", href: "/forms", icon: ClipboardList },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  "divider",
  { label: "Regions", href: "/regions", icon: MapPin, adminOnly: true },
  { label: "Users", href: "/users", icon: UserCog, adminOnly: true },
  { label: "Groupings", href: "/groupings", icon: Layers, adminOnly: true },
  { label: "Bulk Exports", href: "/bulk-exports", icon: Download, adminOnly: true },
  { label: "System Settings", href: "/system-settings", icon: Settings, adminOnly: true },
]

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()
  const { user, logout, hasPermission } = useAuth()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const handleLinkClick = () => {
    onOpenChange(false)
  }

  const handleLogout = () => {
    onOpenChange(false)
    logout()
  }

  const visibleNavItems = mainNavItems
    .filter((item) => {
      if (item === "divider") return true
      if (item.adminOnly) return hasPermission("canManageSettings")
      return true
    })
    .filter((item, index, items) => {
      if (item !== "divider") return true
      const prev = items[index - 1]
      const next = items[index + 1]
      if (!prev || prev === "divider") return false
      if (!next || next === "divider") return false
      return true
    })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar">
        <SheetHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Image
              src="/logo.svg"
              alt="Nexus TOS"
              width={140}
              height={36}
              priority
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <nav className="px-3 py-4 space-y-1">
            {visibleNavItems.map((item, index) => {
              if (item === "divider") {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-3 border-t border-sidebar-border"
                  />
                )
              }

              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar">
          <nav className="px-3 py-2 space-y-1">
            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            <Link
              href="/help"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help Centre</span>
            </Link>
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-10 w-10 bg-sidebar-accent">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user ? getInitials(user.firstName, user.lastName) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
