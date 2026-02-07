"use client"

import Link from "next/link"
import { Bell, Search, Menu, Plus, Sparkles, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
  subtitle?: string
  showActions?: boolean
}

export function Header({
  onMenuClick,
  title,
  subtitle,
  showActions = true,
}: HeaderProps) {
  const { user } = useAuth()

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-0 lg:h-16 lg:flex lg:items-center">
      <div className="flex flex-wrap items-center gap-3 lg:h-full lg:flex-1">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden order-1"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto order-2 lg:order-3">
          {/* Mobile search */}
          <Button variant="ghost" size="icon" className="sm:hidden h-10 w-10">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="relative">
                <Bell className="size-6 text-gray-700" />
                <span className="absolute top-0.5 right-0.5 h-4.5 w-4.5 flex items-center justify-center text-[10px] font-bold bg-primary text-white rounded-full">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" className="text-xs h-auto p-0 text-primary">
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <p className="text-sm font-medium">New IOI log submitted</p>
                <p className="text-xs text-muted-foreground">
                  Mark Thompson submitted a log for James Wilson
                </p>
                <p className="text-xs text-primary">2 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <p className="text-sm font-medium">Task overdue</p>
                <p className="text-xs text-muted-foreground">
                  Monthly report for Maple House is now overdue
                </p>
                <p className="text-xs text-primary">1 hour ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <p className="text-sm font-medium">Shift reminder</p>
                <p className="text-xs text-muted-foreground">
                  Your shift at Oak Lodge starts in 1 hour
                </p>
                <p className="text-xs text-primary">1 hour ago</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Announcements */}
          <Link href="/announcements">
            <Button variant="ghost" size="icon-lg" className="relative">
              <Megaphone className="size-6 text-gray-700" />
            </Button>
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right min-w-0 max-w-[160px]">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === "admin"
                  ? "Administrator"
                  : user?.role === "manager"
                    ? "Manager"
                    : "Staff"}
              </p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-teal-600 text-white">
                {user ? getInitials(user.firstName, user.lastName) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Search */}
        <div className="hidden sm:block order-3 lg:order-2 w-full lg:w-auto lg:flex-1 lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Quick search..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white h-10"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  showNewTask?: boolean
  showAskAI?: boolean
  onNewTask?: () => void
  onAskAI?: () => void
}

export function PageHeader({
  title,
  subtitle,
  showNewTask = true,
  showAskAI = true,
  onNewTask,
  onAskAI,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        {showAskAI && (
          <Button
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={onAskAI}
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
        )}
        {showNewTask && (
          <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={onNewTask}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        )}
      </div>
    </div>
  )
}
