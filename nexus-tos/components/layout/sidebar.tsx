"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  HelpCircle,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { navItems } from "@/config/nav-config"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  // Filter nav items based on user role
  const visibleItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    return user?.role ? item.roles.includes(user.role) : false
  })

  return (
    <aside data-sidebar className="w-64 h-screen bg-sidebar flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border shrink-0">
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

      {/* Navigation - scrollable */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border shrink-0">
        {/* Help Link */}
        <nav className="px-3 py-2">
          <Link
            href="/help"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/help"
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            <span>Help Centre</span>
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
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
