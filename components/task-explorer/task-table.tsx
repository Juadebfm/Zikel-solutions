"use client"

import { useState } from "react"
import type { TaskListItem } from "@/services/tasks.service"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  ArrowUpDown,
  Loader2,
} from "lucide-react"

// ─── Props ────────────────────────────────────────────────────────

interface TaskTableProps {
  items: TaskListItem[]
  loading: boolean
  fetching?: boolean
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  sortBy: string
  sortOrder: "asc" | "desc"
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange: (field: string, order: "asc" | "desc") => void
  onRowClick: (taskId: string) => void
  onDelete?: (taskId: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDate(iso: string | null): string {
  if (!iso) return "-"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "-"
  return dateFormatter.format(d)
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
}

// ─── Badge variants ───────────────────────────────────────────────

function statusBadgeClass(status: string): string {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    case "submitted":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100"
    case "sent_for_approval":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100"
    case "approved":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    case "rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100"
    case "deleted":
    case "deleted_draft":
      return "bg-gray-100 text-gray-500 line-through hover:bg-gray-100"
    case "hidden":
      return "bg-gray-100 text-gray-500 italic hover:bg-gray-100"
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
  }
}

function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case "low":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
    case "medium":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100"
    case "high":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100"
    case "urgent":
      return "bg-red-100 text-red-700 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100"
  }
}

// ─── Sortable columns ─────────────────────────────────────────────

const SORTABLE_FIELDS = ["title", "dueAt", "status", "priority"] as const

// ─── Component ────────────────────────────────────────────────────

export function TaskTable({
  items,
  loading,
  fetching = false,
  page,
  pageSize,
  totalPages,
  totalItems,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRowClick,
  onDelete,
}: TaskTableProps) {
  // Show skeletons on initial load OR when fetching with no items (e.g. first visit to a tab)
  const showSkeleton = loading || (fetching && items.length === 0)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSort(field: string) {
    const nextOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc"
    onSortChange(field, nextOrder)
  }

  function isSortable(field: string): boolean {
    return (SORTABLE_FIELDS as readonly string[]).includes(field)
  }

  // Pagination range
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="rounded-md border relative">
        {/* Subtle overlay when refetching in background (data already visible) */}
        {fetching && !showSkeleton && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-28">Task Ref</TableHead>
              <TableHead>
                <SortButton
                  field="title"
                  label="Title"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  sortable
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>
                <SortButton
                  field="status"
                  label="Status"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  sortable
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  field="priority"
                  label="Priority"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  sortable
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>
                <SortButton
                  field="dueAt"
                  label="Due Date"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  sortable
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-6" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-40 text-center text-muted-foreground">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              items.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick(task.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(task.id)}
                      onCheckedChange={() => toggleOne(task.id)}
                      aria-label={`Select ${task.taskRef}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{task.taskRef}</TableCell>
                  <TableCell className="font-medium max-w-[240px] truncate">
                    {task.title}
                  </TableCell>
                  <TableCell>{task.categoryLabel}</TableCell>
                  <TableCell>{task.relatedEntity?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs", statusBadgeClass(task.status))}>
                      {task.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs capitalize", priorityBadgeClass(task.priority))}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {task.assignee.avatarUrl && (
                            <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {getInitials(task.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[120px]">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(task.dueAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => onRowClick(task.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete?.(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart}-{rangeEnd} of {totalItems}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <select
              className="h-8 rounded-md border bg-background px-2 text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sort button sub-component ────────────────────────────────────

function SortButton({
  field,
  label,
  sortBy,
  sortOrder,
  sortable,
  onSort,
}: {
  field: string
  label: string
  sortBy: string
  sortOrder: "asc" | "desc"
  sortable: boolean
  onSort: (field: string) => void
}) {
  if (!sortable) return <>{label}</>

  const isActive = sortBy === field

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => onSort(field)}
    >
      {label}
      <ArrowUpDown
        className={cn("ml-1 h-3.5 w-3.5", isActive ? "opacity-100" : "opacity-40")}
      />
    </Button>
  )
}
