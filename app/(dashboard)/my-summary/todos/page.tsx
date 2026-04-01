"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { PageHeader } from "@/components/layout/header"
import { SummaryTaskCard } from "@/components/dashboard/summary-task-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useSummaryTodos } from "@/hooks/api/use-summary"
import { getApiErrorMessage } from "@/lib/api/error"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-teal-600",
  "bg-red-600",
  "bg-amber-600",
  "bg-green-600",
  "bg-indigo-600",
  "bg-pink-600",
]

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 border-gray-200" },
  "not-started": { label: "Not Started", className: "bg-amber-100 text-amber-700 border-amber-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200" },
}

export default function SummaryTodosPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const showError = useErrorModalStore((s) => s.show)

  const todosQuery = useSummaryTodos({
    page,
    pageSize: PAGE_SIZE,
    sortBy: "dueDate",
    sortOrder: "asc",
    search: search || undefined,
  })

  useEffect(() => {
    if (todosQuery.error) {
      showError(getApiErrorMessage(todosQuery.error, "Unable to load to do tasks."))
    }
  }, [todosQuery.error, showError])

  const meta = todosQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? todosQuery.data?.items.length ?? 0
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = totalItems === 0 ? 0 : Math.min(page * PAGE_SIZE, totalItems)

  const effectivePage = Math.min(page, totalPages)

  const items = useMemo(() => {
    return (todosQuery.data?.items ?? []).map((item) => {
      const assigneeName = item.assignee?.name || "Unassigned"
      const status = toTodoStatus(item.status, item.dueAt ?? null)
      return {
        id: item.id,
        taskId: item.id,
        title: item.title,
        relatedTo: item.relatedEntity?.name ?? "-",
        dueDate: item.dueAt ? formatDate(item.dueAt) : "-",
        statusLabel: statusConfig[status].label,
        statusClassName: statusConfig[status].className,
        assigneeName,
        initials: toInitials(assigneeName),
        color: colorFromString(assigneeName),
      }
    })
  }, [todosQuery.data?.items])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/my-summary" className="font-medium text-primary hover:underline">
          My Summary
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">To Do List</span>
      </div>

      <PageHeader
        title="To Do List"
        subtitle="Review all tasks in your to do queue."
        showNewTask={false}
        showAskAI={false}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search tasks by title, ID, relation, or assignee"
              className="pl-9"
            />
          </div>
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{rangeStart}</span>-
            <span className="font-medium text-gray-900">{rangeEnd}</span> of{" "}
            <span className="font-medium text-gray-900">{totalItems}</span>
          </p>
        </div>
      </div>

      {todosQuery.error ? (
        <p className="text-sm text-muted-foreground">Unable to load to do tasks.</p>
      ) : null}

      <div className="space-y-3">
        {todosQuery.isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={`todo-skeleton-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                <Skeleton className="h-6 w-2/3" />
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))
          : items.length === 0
            ? (
              <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
                No tasks to display.
              </div>
            )
            : items.map((item) => (
              <SummaryTaskCard
                key={item.id}
                title={item.title}
                taskId={`#${item.taskId}`}
                relatedTo={item.relatedTo}
                dueDate={item.dueDate}
                personName={item.assigneeName}
                avatarInitials={item.initials}
                avatarColor={item.color}
                badges={(
                  <Badge variant="outline" className={cn("text-[11px] shrink-0", item.statusClassName)}>
                    {item.statusLabel}
                  </Badge>
                )}
                actions={(
                  <Link href={`/tasks?taskId=${encodeURIComponent(item.taskId)}`}>
                    <Button variant="link" className="h-auto px-0 text-primary">
                      View
                    </Button>
                  </Link>
                )}
              />
            ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1 || todosQuery.isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages || todosQuery.isLoading}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function toTodoStatus(status: string, dueDate: string | null): "draft" | "not-started" | "in-progress" | "overdue" {
  if (status === "draft") {
    return "draft"
  }

  if (!dueDate) return status === "pending" ? "not-started" : "in-progress"
  const dueTimestamp = Date.parse(dueDate)
  if (!Number.isNaN(dueTimestamp) && dueTimestamp < Date.now()) {
    return "overdue"
  }

  if (status === "pending") {
    return "not-started"
  }

  return "in-progress"
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function toInitials(value: string): string {
  const normalized = value.trim()
  if (!normalized) {
    return "U"
  }

  const parts = normalized.split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U"
}

function colorFromString(value: string): string {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
