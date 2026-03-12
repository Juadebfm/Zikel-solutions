"use client"

import { useMemo, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "@/components/layout/header"
import { StatsOverview, defaultStats, type StatItem } from "@/components/dashboard/stats-overview"
import { TodoList, type TodoItem } from "@/components/dashboard/todo-list"
import { TasksToApprove, type ApprovalTask } from "@/components/dashboard/tasks-to-approve"
import { Provisions, type HomeProvision } from "@/components/dashboard/provisions"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { isApiClientError } from "@/lib/api/error"
import { useAskAi } from "@/hooks/api/use-ai"
import {
  useApproveSummaryTask,
  useProcessSummaryBatch,
  useSummaryProvisions,
  useSummaryStats,
  useSummaryTasksToApprove,
  useSummaryTodos,
} from "@/hooks/api/use-summary"

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

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
})

export default function MySummaryPage() {
  const { user, logout } = useAuth()
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canApproveIOILogs")
  const [isAskAiOpen, setIsAskAiOpen] = useState(false)
  const [askAiQuery, setAskAiQuery] = useState("What should I focus on today?")
  const [askAiError, setAskAiError] = useState<string | null>(null)

  const statsQuery = useSummaryStats()
  const todosQuery = useSummaryTodos({ page: 1, pageSize: 20, sortBy: "dueDate", sortOrder: "asc" })
  const tasksToApproveQuery = useSummaryTasksToApprove({ page: 1, pageSize: 20 }, allowed)
  const provisionsQuery = useSummaryProvisions()

  const processBatchMutation = useProcessSummaryBatch()
  const approveTaskMutation = useApproveSummaryTask()
  const askAiMutation = useAskAi()

  const stats = useMemo<StatItem[]>(() => {
    if (!statsQuery.data) {
      return defaultStats
    }

    const data = statsQuery.data

    return defaultStats.map((stat) => {
      switch (stat.label) {
        case "Overdue Tasks":
          return { ...stat, value: data.overdue }
        case "Tasks Due Today":
          return { ...stat, value: data.dueToday }
        case "Pending Approval":
          return { ...stat, value: data.pendingApproval }
        case "Rejected Tasks":
          return { ...stat, value: data.rejected }
        case "Draft Tasks":
          return { ...stat, value: data.draft }
        case "Future Tasks":
          return { ...stat, value: data.future }
        case "Comments":
          return { ...stat, value: data.comments }
        case "Pending Rewards":
          return { ...stat, value: data.rewards }
        default:
          return stat
      }
    })
  }, [statsQuery.data])

  const todoItems = useMemo<TodoItem[]>(() => {
    return (todosQuery.data?.items ?? []).map((item) => {
      const assigneeName = item.assignee || "Unassigned"
      return {
        id: item.id,
        taskId: item.id,
        title: item.title,
        relatedTo: item.relation,
        dueDate: formatDate(item.dueDate),
        status: toTodoStatus(item.status, item.dueDate),
        assignee: {
          name: assigneeName,
          initials: toInitials(assigneeName),
          color: colorFromString(assigneeName),
        },
      }
    })
  }, [todosQuery.data?.items])

  const approvalTasks = useMemo<ApprovalTask[]>(() => {
    return (tasksToApproveQuery.data?.items ?? []).map((item) => {
      const submitter = item.assignee || "Unknown"
      return {
        id: item.id,
        taskId: item.id,
        title: item.title,
        relatedTo: item.relation,
        dueDate: formatDate(item.dueDate),
        status: toApprovalStatus(item.approvalStatus, item.priority),
        submitter: {
          name: submitter,
          initials: toInitials(submitter),
          color: colorFromString(submitter),
        },
      }
    })
  }, [tasksToApproveQuery.data?.items])

  const homeProvisions = useMemo<HomeProvision[]>(() => {
    return (provisionsQuery.data ?? []).map((home) => ({
      id: home.homeId,
      name: home.homeName,
      events: home.events.map((event) => ({
        id: event.id,
        title: event.title,
        time: formatDateTime(event.time),
        type: "appointment",
        typeLabel: "Event",
        assignedTo: "Assigned Team",
        assignees: "Any",
        initials: toInitials(event.title),
        avatarColor: colorFromString(event.title),
      })),
      shifts: home.shifts.map((shift) => ({
        id: shift.employeeId,
        name: shift.employeeName,
        role: "Staff",
        shift: `${formatClock(shift.startTime)} — ${formatClock(shift.endTime)}`,
        initials: toInitials(shift.employeeName),
        avatarColor: colorFromString(shift.employeeName),
      })),
    }))
  }, [provisionsQuery.data])

  const askAiContext = useMemo(() => {
    const context: {
      stats?: Record<string, unknown>
      todos?: Array<Record<string, unknown>>
      tasksToApprove?: Array<Record<string, unknown>>
    } = {}

    if (statsQuery.data) {
      context.stats = {
        overdue: statsQuery.data.overdue,
        dueToday: statsQuery.data.dueToday,
        pendingApproval: statsQuery.data.pendingApproval,
        rejected: statsQuery.data.rejected,
        draft: statsQuery.data.draft,
        future: statsQuery.data.future,
        comments: statsQuery.data.comments,
        rewards: statsQuery.data.rewards,
      }
    }

    if (todosQuery.data?.items.length) {
      context.todos = todosQuery.data.items.slice(0, 5).map((todo) => ({
        id: todo.id,
        title: todo.title,
        relation: todo.relation,
        status: todo.status,
        dueDate: todo.dueDate,
      }))
    }

    if (tasksToApproveQuery.data?.items.length) {
      context.tasksToApprove = tasksToApproveQuery.data.items.slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        relation: task.relation,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      }))
    }

    return Object.keys(context).length > 0 ? context : undefined
  }, [statsQuery.data, todosQuery.data, tasksToApproveQuery.data])

  const isPageLoading =
    statsQuery.isLoading ||
    todosQuery.isLoading ||
    provisionsQuery.isLoading ||
    (allowed && tasksToApproveQuery.isLoading)

  const pageErrorMessage =
    getErrorMessage(statsQuery.error) ||
    getErrorMessage(todosQuery.error) ||
    getErrorMessage(provisionsQuery.error) ||
    getErrorMessage(tasksToApproveQuery.error)

  const handleNewTask = () => {
    // Task module is not yet part of the live backend scope.
  }

  const handleAskAI = () => {
    setAskAiError(null)
    setIsAskAiOpen(true)
  }

  const submitAskAi = async (queryOverride?: string) => {
    const query = (queryOverride ?? askAiQuery).trim()

    if (query.length < 3) {
      setAskAiError("Please enter at least 3 characters.")
      return
    }

    setAskAiError(null)
    setAskAiQuery(query)

    try {
      await askAiMutation.mutateAsync({
        query,
        page: "summary",
        context: askAiContext,
      })
    } catch (error) {
      if (isApiClientError(error) && error.status === 401) {
        await logout()
        return
      }

      setAskAiError(getAskAiErrorMessage(error))
    }
  }

  const handleAskAiSubmit = () => {
    void submitAskAi()
  }

  const handleSuggestionClick = (action: string) => {
    setAskAiQuery(action)
    void submitAskAi(action)
  }

  const handleViewApproval = (id: string) => {
    // Task details route is not in the current live backend scope.
    // Keep hook point for when task module is registered.
    void id
  }

  const handleApproveTask = (id: string) => {
    guard(() => {
      approveTaskMutation.mutate({ taskId: id })
    })
  }

  const handleProcessBatch = () => {
    guard(() => {
      const taskIds = approvalTasks.map((task) => task.id)
      if (taskIds.length === 0) return

      processBatchMutation.mutate({
        taskIds,
        action: "approve",
      })
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-1">Welcome back, {user?.firstName}!</p>
        <PageHeader
          title="My Summary"
          subtitle="Here's an overview of your tasks and activities."
          showNewTask={true}
          showAskAI={true}
          onNewTask={handleNewTask}
          onAskAI={handleAskAI}
        />
      </div>

      {pageErrorMessage && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {pageErrorMessage}
        </div>
      )}

      {isPageLoading && (
        <div className="p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
          Loading summary data...
        </div>
      )}

      <StatsOverview stats={stats} />

      <AccessBanner show={!allowed} message="You have view-only access to approval actions on this page." />

      <div className="grid lg:grid-cols-2 gap-6">
        <TodoList items={todoItems} />
        <TasksToApprove
          items={approvalTasks}
          onView={handleViewApproval}
          onApprove={handleApproveTask}
          onProcessBatch={handleProcessBatch}
        />
      </div>

      <Provisions homes={homeProvisions} />

      <Dialog open={isAskAiOpen} onOpenChange={setIsAskAiOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ask AI
            </DialogTitle>
            <DialogDescription>
              Ask for a priority summary, blockers, or next actions based on your current dashboard data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={askAiQuery}
              onChange={(event) => setAskAiQuery(event.target.value)}
              placeholder="What should I focus on today?"
              className="min-h-24 resize-y"
            />

            {askAiError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {askAiError}
              </div>
            )}

            {askAiMutation.data && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={askAiMutation.data.source === "model" ? "default" : "outline"}>
                    {askAiMutation.data.source === "model" ? "Model" : "Fallback"}
                  </Badge>
                  <Badge variant="outline">Stats: {askAiMutation.data.statsSource}</Badge>
                  {askAiMutation.data.model ? (
                    <Badge variant="outline">{askAiMutation.data.model}</Badge>
                  ) : null}
                </div>

                <p className="text-sm text-gray-900 whitespace-pre-wrap">{askAiMutation.data.answer}</p>

                {askAiMutation.data.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {askAiMutation.data.suggestions.map((suggestion, index) => (
                      <Button
                        key={`${suggestion.action}-${index}`}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion.action)}
                        disabled={askAiMutation.isPending}
                      >
                        {suggestion.label}
                      </Button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Generated at {formatDateTime(askAiMutation.data.generatedAt)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAskAiOpen(false)}
              disabled={askAiMutation.isPending}
            >
              Close
            </Button>
            <Button type="button" onClick={handleAskAiSubmit} disabled={askAiMutation.isPending}>
              {askAiMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Ask AI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}

function toTodoStatus(status: string, dueDate: string): TodoItem["status"] {
  if (status === "draft") {
    return "draft"
  }

  const dueTimestamp = Date.parse(dueDate)
  if (!Number.isNaN(dueTimestamp) && dueTimestamp < Date.now()) {
    return "overdue"
  }

  if (status === "pending") {
    return "not-started"
  }

  return "in-progress"
}

function toApprovalStatus(
  approvalStatus: string,
  priority: string
): ApprovalTask["status"] {
  if (priority === "high") {
    return "urgent"
  }

  if (approvalStatus.includes("review")) {
    return "needs-review"
  }

  return "sent-for-approval"
}

function toInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? "U"
  const second = words[1]?.[0] ?? ""
  return `${first}${second}`.toUpperCase()
}

function colorFromString(input: string): string {
  const hash = [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return DATE_FORMATTER.format(date)
}

function formatClock(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "--:--"
  }

  return TIME_FORMATTER.format(date)
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return `${DATE_FORMATTER.format(date)} ${TIME_FORMATTER.format(date)}`
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  return "Unable to load data from the backend."
}

function getAskAiErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    if (error.status === 400 || error.status === 422) {
      return "Your prompt was invalid. Please enter a clearer question."
    }

    if (error.status === 429) {
      return "Too many AI requests. Please wait a moment and try again."
    }

    if (error.status >= 500) {
      return "AI is temporarily unavailable. Please try again shortly."
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unable to get AI response right now."
}
