"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Building2,
  Check,
  HelpCircle,
  Loader2,
  LogOut,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { navItems } from "@/config/nav-config"
import { BrandMark } from "@/components/shared/brand-mark"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { canManageTenantAdministration } from "@/lib/auth/rbac"

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()
  const {
    user,
    session,
    hasPermission,
    switchTenant,
    logout,
    hasPendingAcknowledgements,
  } = useAuth()
  const [isSwitchingTenant, setIsSwitchingTenant] = useState(false)
  const [tenantError, setTenantError] = useState<string | null>(null)

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

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === activeTenantId || isSwitchingTenant) return

    setTenantError(null)
    setIsSwitchingTenant(true)

    const result = await switchTenant(tenantId)
    if (!result.success) {
      setTenantError(result.message ?? "Unable to switch tenant.")
    } else {
      onOpenChange(false)
    }

    setIsSwitchingTenant(false)
  }

  // Filter nav items: permissions from /me/permissions are the primary gate.
  const defaultVisibleItems = navItems.filter((item) => {
    if (item.hidden) return false

    const isTenantAdminUser = session?.activeTenantRole === "tenant_admin"

    const roleAllowed = !item.roles || item.roles.length === 0
      ? true
      : isTenantAdminUser || Boolean(user?.role && item.roles.includes(user.role))

    const permissionAllowed = item.permission ? hasPermission(item.permission) : true

    const inviteFallbackAllowed =
      item.href === "/users" && canManageTenantAdministration(user?.role, session?.activeTenantRole)

    return roleAllowed && (permissionAllowed || inviteFallbackAllowed)
  })

  const visibleItems = hasPendingAcknowledgements
    ? [
        {
          label: "Acknowledgements",
          href: "/acknowledgements",
          icon: ShieldCheck,
        },
      ]
    : defaultVisibleItems

  const memberships = session?.memberships ?? []
  const activeTenantId = session?.activeTenantId ?? null
  const canSwitchTenant = memberships.length > 1

  const activeTenantName =
    memberships.find((m) => m.tenantId === activeTenantId)?.tenantName ??
    activeTenantId ??
    "No active tenant"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar flex flex-col">
        <SheetHeader className="p-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <BrandMark size={36} priority />
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

        {/* Tenant Switcher */}
        <div className="px-3 py-3 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Building2 className="h-4 w-4 text-sidebar-foreground/60 shrink-0" />
            <p className="text-xs text-sidebar-foreground/80 truncate font-medium">{activeTenantName}</p>
          </div>
          {canSwitchTenant && (
            <div className="mt-1 space-y-0.5">
              <p className="px-3 text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-medium">
                Switch tenant
              </p>
              {memberships.map((membership) => {
                const isActive = membership.tenantId === activeTenantId
                return (
                  <button
                    key={membership.id}
                    onClick={() => void handleTenantSwitch(membership.tenantId)}
                    disabled={isSwitchingTenant || isActive}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                      isActive
                        ? "text-sidebar-foreground/60"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                    )}
                  >
                    {isSwitchingTenant && !isActive ? (
                      <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    ) : isActive ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Building2 className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{membership.tenantName ?? membership.tenantId}</span>
                  </button>
                )
              })}
              {tenantError && (
                <p className="px-3 text-[10px] text-red-400">{tenantError}</p>
              )}
            </div>
          )}
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
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
        <div className="border-t border-sidebar-border bg-sidebar shrink-0">
          {!hasPendingAcknowledgements ? (
            <nav className="px-3 py-2 space-y-1">
              <Link
                href="/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <Link
                href="/help"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help Centre</span>
              </Link>
            </nav>
          ) : null}

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
