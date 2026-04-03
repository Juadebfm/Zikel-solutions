"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"

import { PageHeader } from "@/components/layout/header"
import { SummaryTaskDrawer } from "@/components/dashboard/summary-task-drawer"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSummaryTodos } from "@/hooks/api/use-summary"
import { useUpdateTask } from "@/hooks/api/use-tasks"
import { getApiErrorMessage } from "@/lib/api/error"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
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
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600 border-gray-200" },
}

export default function SummaryTodosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [resolvingTaskIds, setResolvingTaskIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)
  const updateTaskMutation = useUpdateTask()

  const todosQuery = useSummaryTodos({
    page,
    pageSize: PAGE_SIZE,
    sortBy: "dueAt",
    sortOrder: "asc",
    search: search || undefined,
  })

  useEffect(() => {
    if (todosQuery.error) {
      showError(getApiErrorMessage(todosQuery.error, "Unable to load to do tasks."))
    }
  }, [todosQuery.error, showError])

  const meta = todosQuery.data?.meta
  const sourceTasks = todosQuery.data?.items ?? []
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? sourceTasks.length ?? 0
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = totalItems === 0 ? 0 : Math.min(page * PAGE_SIZE, totalItems)
  const selectedTaskId = searchParams.get("taskId")
  const drawerTaskId = searchParams.get("openDrawer") === "1" ? selectedTaskId : null

  const items = useMemo(() => {
    return sourceTasks.map((item) => {
      const assigneeName = item.assignee?.name || "Unassigned"
      const status = toTodoStatus(item.status, item.dueAt ?? null)
      return {
        id: item.id,
        taskId: item.id,
        taskRef: item.taskRef,
        category: item.domain ?? item.categoryLabel,
        workflowStatus: item.status,
        title: item.title,
        relatedTo: item.relatedEntity?.name ?? "-",
        dueDate: item.dueAt ? formatDate(item.dueAt) : "-",
        submittedAt: item.submittedAt ? formatDateTime(item.submittedAt) : "-",
        statusLabel: statusConfig[status].label,
        statusClassName: statusConfig[status].className,
        assigneeName,
        initials: toInitials(assigneeName),
        color: colorFromString(assigneeName),
      }
    })
  }, [sourceTasks])

  const selectedTask = useMemo(() => {
    if (!drawerTaskId) return null
    return sourceTasks.find((task) => task.id === drawerTaskId) ?? null
  }, [drawerTaskId, sourceTasks])

  const openTask = useCallback(
    (taskId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("taskId", taskId)
      params.set("openDrawer", "1")
      router.replace(`/my-summary/todos?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const closeTaskDrawer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("openDrawer")
    const query = params.toString()
    router.replace(query ? `/my-summary/todos?${query}` : "/my-summary/todos", { scroll: false })
  }, [router, searchParams])

  const handleResolveNow = useCallback(
    (taskId: string) => {
      if (resolvingTaskIds.has(taskId)) {
        return
      }

      setResolvingTaskIds((previous) => {
        if (previous.has(taskId)) return previous
        const next = new Set(previous)
        next.add(taskId)
        return next
      })

      updateTaskMutation.mutate(
        {
          taskId,
          payload: { status: "completed" },
        },
        {
          onSuccess: () => {
            showToast("Task marked as completed.")
            const params = new URLSearchParams(searchParams.toString())
            params.set("taskId", taskId)
            params.set("openDrawer", "1")
            router.replace(`/my-summary/todos?${params.toString()}`, { scroll: false })
          },
          onError: (error) => {
            showError(getApiErrorMessage(error, "Unable to mark task as completed."))
          },
          onSettled: () => {
            setResolvingTaskIds((previous) => {
              if (!previous.has(taskId)) return previous
              const next = new Set(previous)
              next.delete(taskId)
              return next
            })
          },
        }
      )
    },
    [resolvingTaskIds, router, searchParams, showError, showToast, updateTaskMutation]
  )

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

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {todosQuery.isLoading
          ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Ref</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`todo-skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-36" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
          : items.length === 0
            ? (
              <div className="py-16 text-center text-sm text-gray-500">
                No tasks to display.
              </div>
            )
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Ref</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isCompleted = item.workflowStatus === "completed"
                    const canResolve = item.workflowStatus === "pending" || item.workflowStatus === "in_progress"
                    const isResolving = resolvingTaskIds.has(item.id)

                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "cursor-pointer hover:bg-gray-50",
                          selectedTaskId === item.id && "bg-primary/5"
                        )}
                        onClick={() => openTask(item.id)}
                      >
                        <TableCell className="font-mono text-xs text-gray-600">
                          {item.taskRef || `#${item.taskId}`}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">{item.relatedTo}</TableCell>
                        <TableCell className="text-sm text-gray-700">{item.dueDate}</TableCell>
                        <TableCell className="text-sm text-gray-500">{item.submittedAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={cn("text-[10px] text-white", item.color)}>
                                {item.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">{item.assigneeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[11px] shrink-0", item.statusClassName)}>
                            {item.statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openTask(item.id)}>
                              View
                            </Button>
                            {canResolve ? (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white"
                                onClick={() => handleResolveNow(item.id)}
                                disabled={isResolving}
                              >
                                {isResolving ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Resolving...
                                  </>
                                ) : (
                                  "Resolve Now"
                                )}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                {isCompleted ? "Completed" : "Unavailable"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
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

      <SummaryTaskDrawer
        task={selectedTask}
        open={drawerTaskId !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeTaskDrawer()
          }
        }}
        onResolve={handleResolveNow}
        resolving={Boolean(selectedTask && resolvingTaskIds.has(selectedTask.id))}
      />
    </div>
  )
}

function toTodoStatus(
  status: string,
  dueDate: string | null
): "draft" | "not-started" | "in-progress" | "overdue" | "completed" | "cancelled" {
  if (status === "draft") {
    return "draft"
  }

  if (status === "completed") {
    return "completed"
  }

  if (status === "cancelled") {
    return "cancelled"
  }

  if (status === "in_progress") {
    if (!dueDate) return "in-progress"
    const dueTimestamp = Date.parse(dueDate)
    if (!Number.isNaN(dueTimestamp) && dueTimestamp < Date.now()) {
      return "overdue"
    }
    return "in-progress"
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

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
