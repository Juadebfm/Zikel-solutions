"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Archive,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Paperclip,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface TodoItem {
  /** Raw internal id (CUID) — used only for API calls / navigation. */
  id: string
  /** Human-readable ref from BE (e.g. TSK-YYYYMMDD-XXXXXX). Displayed as user-facing ID. */
  taskRef: string
  title: string
  description?: string
  /** Design label from BE (e.g. "Compliance", "Operations"). */
  domain?: string
  /** Human-readable status label from BE. Falls back to local statusConfig. */
  statusLabel?: string
  status: "draft" | "not-started" | "in-progress" | "overdue"
  /** ISO timestamp — used to derive "2h ago" display. */
  submittedAt?: string | null
  dueDate: string
  /** links.taskUrl from BE — preferred for in-app navigation. */
  taskUrl?: string | null
  /** links.documentUrl from BE — for document open / download. */
  documentUrl?: string | null
  /** referenceSummary.documents from BE. */
  documentsCount?: number
  assignee: {
    name: string
    initials: string
    color: string
    avatarUrl?: string | null
  }
  additionalAssignees?: Array<{
    initials: string
    color: string
    avatarUrl?: string | null
  }>
}

interface TodoListProps {
  items: TodoItem[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onArchive?: (ids: string[]) => void
  onPostpone?: (ids: string[]) => void
  onReassign?: (taskId: string, assigneeId: string, reason?: string) => void
}

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-500 border-gray-200" },
  "not-started": {
    label: "Pending",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  "in-progress": {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  overdue: { label: "Overdue", className: "bg-red-50 text-red-600 border-red-200" },
}

const categoryColors: Record<string, string> = {
  compliance: "text-red-600",
  operations: "text-blue-600",
  urgent: "text-red-600",
  finance: "text-emerald-600",
  staffing: "text-purple-600",
  maintenance: "text-amber-600",
}

function getCategoryColor(category: string) {
  return categoryColors[category.toLowerCase()] ?? "text-gray-600"
}

function formatTimeAgo(isoDate: string | null | undefined): string | undefined {
  if (!isoDate) return undefined
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return undefined

  const diffMs = Date.now() - date.getTime()
  const absDiff = Math.abs(diffMs)
  const minutes = Math.floor(absDiff / 60_000)
  const hours = Math.floor(absDiff / 3_600_000)
  const days = Math.floor(absDiff / 86_400_000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

function resolveTaskHref(item: TodoItem): string {
  if (item.taskUrl) return item.taskUrl
  return `/tasks?taskId=${encodeURIComponent(item.id)}`
}

function getActionButton(item: TodoItem) {
  const href = resolveTaskHref(item)

  if (item.status === "overdue") {
    return (
      <Link href={href}>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 rounded-md"
        >
          RESOLVE NOW
        </Button>
      </Link>
    )
  }
  if (item.status === "not-started" || item.status === "draft") {
    return (
      <Link href={href}>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 rounded-md"
        >
          EXECUTE
        </Button>
      </Link>
    )
  }
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="sm"
        className="text-xs font-semibold px-4 rounded-md border-gray-300"
      >
        VIEW DETAILS
      </Button>
    </Link>
  )
}

export function TodoList({
  items,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = items.length,
  pageSize = 10,
  onPageChange,
  onArchive,
  onPostpone,
}: TodoListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const canPaginate = totalPages > 1 && Boolean(onPageChange)
  const allSelected = items.length > 0 && selectedIds.size === items.length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("ellipsis")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("ellipsis")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">To Do List</CardTitle>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-3 py-1 rounded-full">
          {totalItems} ACTIVE TASKS
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              disabled={items.length === 0}
            />
            Select All
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 text-xs gap-1.5"
              disabled={selectedIds.size === 0}
              onClick={() => onArchive?.(Array.from(selectedIds))}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 text-xs gap-1.5"
              disabled={selectedIds.size === 0}
              onClick={() => onPostpone?.(Array.from(selectedIds))}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Postpone
            </Button>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading to do tasks...
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No tasks to display
            </p>
          ) : (
            items.map((item) => {
              const status = statusConfig[item.status]
              const displayLabel = item.domain ?? item.taskRef
              const timeAgo = formatTimeAgo(item.submittedAt)
              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      {/* Top row: domain + submittedAt time-ago + statusLabel */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn("font-bold uppercase tracking-wide", getCategoryColor(displayLabel))}>
                            {displayLabel}
                          </span>
                          {timeAgo && (
                            <>
                              <span className="text-gray-300">&#x2022;</span>
                              <span className="text-gray-400">{timeAgo}</span>
                            </>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider border-0 px-2 py-0.5 rounded",
                            status.className
                          )}
                        >
                          {item.statusLabel || status.label}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                        {item.title}
                      </h3>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Bottom row */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {/* Assignee avatars */}
                          <div className="flex -space-x-2">
                            <Avatar className="h-7 w-7 border-2 border-white">
                              <AvatarFallback
                                className={cn("text-white text-[10px] font-semibold", item.assignee.color)}
                              >
                                {item.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                            {item.additionalAssignees?.map((a, i) => (
                              <Avatar key={i} className="h-7 w-7 border-2 border-white">
                                <AvatarFallback
                                  className={cn("text-white text-[10px] font-semibold", a.color)}
                                >
                                  {a.initials}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>

                          {/* Document count from referenceSummary.documents */}
                          {item.documentsCount != null && item.documentsCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Paperclip className="h-3 w-3" />
                              {item.documentsCount} Document{item.documentsCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {getActionButton(item)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {canPaginate && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-gray-600 gap-1"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              PREV
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === "ellipsis" ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 text-xs rounded-md",
                      page === currentPage
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                    onClick={() => onPageChange?.(page)}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-gray-600 gap-1"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              NEXT
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
