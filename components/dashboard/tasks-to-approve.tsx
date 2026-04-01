"use client"

import { useState } from "react"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface ApprovalTask {
  /** Raw internal id (CUID) — used only for API calls (/tasks-to-approve/:id). */
  id: string
  /** Human-readable ref from BE (e.g. TSK-YYYYMMDD-XXXXXX). */
  taskRef: string
  /** Secondary human-readable ID from BE, shown as "Request ID: #XXXX". */
  requestId?: string
  title: string
  description?: string
  /** Design label from BE (e.g. "Staffing", "Finance", "Compliance"). */
  domain?: string
  /** Human-readable status label from BE (e.g. "Reviewing", "Awaiting"). */
  statusLabel?: string
  status: "sent-for-approval" | "needs-review" | "urgent"
  reviewed: boolean
  dueDate: string
  /** ISO timestamp — used to derive "2h ago" display. */
  submittedAt?: string | null
  /** links.taskUrl from BE — preferred for in-app navigation. */
  taskUrl?: string | null
  /** links.documentUrl from BE — for document open / download. */
  documentUrl?: string | null
  submitter: {
    name: string
    initials: string
    color: string
    avatarUrl?: string | null
  }
  /** previewFields from BE — rendered as the stats strip on the card. */
  previewFields?: Array<{ label: string; value: string; highlight?: boolean }>
  /** New contextual hints from BE queue endpoint for clarity in review/approval flows. */
  context?: {
    formName?: string | null
    formGroup?: string | null
    homeOrSchool?: string | null
    relatedTo?: string | null
    taskDate?: string | null
    submittedBy?: string | null
    updatedBy?: string | null
    summary?: string | null
  } | null
}

interface TasksToApproveProps {
  items: ApprovalTask[]
  onView?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onApproveAll?: (ids: string[]) => void
  onRejectAll?: (ids: string[]) => void
  onProcessBatch?: () => void
  loading?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  allReviewed?: boolean
}

const statusConfig = {
  "sent-for-approval": {
    label: "Awaiting",
    className: "text-gray-400",
  },
  "needs-review": {
    label: "Reviewing",
    className: "text-gray-400",
  },
  urgent: {
    label: "Awaiting",
    className: "text-gray-400",
  },
}

const categoryColors: Record<string, string> = {
  staffing: "text-gray-500",
  finance: "text-gray-500",
  compliance: "text-gray-500",
  operations: "text-gray-500",
}

function getCategoryColor(category: string) {
  return categoryColors[category.toLowerCase()] ?? "text-gray-500"
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

function getApproveLabel(domain?: string) {
  const d = (domain ?? "").toLowerCase()
  if (d === "compliance") return "SIGN-OFF"
  return "APPROVE"
}

export function TasksToApprove({
  items,
  onView,
  onApprove,
  onReject,
  onApproveAll,
  onRejectAll,
  onProcessBatch,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = items.length,
  pageSize = 10,
  onPageChange,
  allReviewed = false,
}: TasksToApproveProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const canPaginate = totalPages > 1 && Boolean(onPageChange)
  const allSelected = items.length > 0 && selectedIds.size === items.length
  const pendingCount = totalItems

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
        <CardTitle className="text-xl font-bold text-gray-900">Approvals</CardTitle>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
          {pendingCount} PENDING SIGN-OFF
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
              className="text-emerald-600 hover:text-emerald-700 text-xs gap-1.5 font-semibold"
              disabled={selectedIds.size === 0}
              onClick={() => {
                if (onApproveAll) {
                  onApproveAll(Array.from(selectedIds))
                } else if (onProcessBatch) {
                  onProcessBatch()
                }
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 text-xs gap-1.5 font-semibold"
              disabled={selectedIds.size === 0}
              onClick={() => onRejectAll?.(Array.from(selectedIds))}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        </div>

        {/* Approval list */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading approval tasks...
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No tasks awaiting approval
            </p>
          ) : (
            items.map((item) => {
              const status = statusConfig[item.status]
              const displayDomain = item.domain ?? item.taskRef
              const displayId = item.requestId ?? item.taskRef
              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                      {item.submitter.avatarUrl ? (
                        <AvatarImage src={item.submitter.avatarUrl} alt={item.submitter.name} />
                      ) : null}
                      <AvatarFallback
                        className={cn("text-white text-xs font-semibold", item.submitter.color)}
                      >
                        {item.submitter.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Top row: domain + request ID + statusLabel */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={cn(
                              "font-semibold uppercase tracking-wide",
                              getCategoryColor(displayDomain)
                            )}
                          >
                            {displayDomain}
                          </span>
                          {displayId && (
                            <>
                              <span className="text-gray-300">&#x2022;</span>
                              <span className="text-gray-400">Request ID: #{displayId}</span>
                            </>
                          )}
                        </div>
                        <span className={cn("text-[10px] font-medium uppercase tracking-wider italic", status.className)}>
                          {item.statusLabel || status.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">
                        {item.title}
                      </h3>

                      {/* Description */}
                      {(item.description || item.context?.summary) && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {item.description || item.context?.summary}
                        </p>
                      )}

                      {/* previewFields stats strip */}
                      {item.previewFields && item.previewFields.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 my-3">
                          {item.previewFields.map((field) => (
                            <div key={field.label}>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                {field.label}
                              </p>
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  field.highlight ? "text-primary" : "text-gray-900"
                                )}
                              >
                                {field.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fallback when no previewFields: show submitter + due date */}
                      {(!item.previewFields || item.previewFields.length === 0) && (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 my-3">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                              Requested by
                            </p>
                            <p className="text-xs font-semibold text-gray-900">
                              {item.context?.submittedBy || item.submitter.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                              Task Date
                            </p>
                            <p className="text-xs font-semibold text-gray-900">
                              {item.context?.taskDate ? formatTimeAgo(item.context.taskDate) ?? item.dueDate : item.dueDate}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        {onApprove && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-6 rounded-md gap-1.5 flex-1 sm:flex-none"
                            onClick={() => onApprove(item.id)}
                            disabled={!item.reviewed}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {getApproveLabel(item.domain)}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold px-4 rounded-md border-gray-300 text-gray-700"
                          onClick={() => onView?.(item.id)}
                        >
                          REVIEW
                        </Button>
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
