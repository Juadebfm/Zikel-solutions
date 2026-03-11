"use client"

import { useMemo } from "react"

import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "@/components/layout/header"
import { StatsOverview, defaultStats, type StatItem } from "@/components/dashboard/stats-overview"
import { TodoList, type TodoItem } from "@/components/dashboard/todo-list"
import { TasksToApprove, type ApprovalTask } from "@/components/dashboard/tasks-to-approve"
import { Provisions, type HomeProvision } from "@/components/dashboard/provisions"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
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
  const { user } = useAuth()
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canApproveIOILogs")

  const statsQuery = useSummaryStats()
  const todosQuery = useSummaryTodos({ page: 1, pageSize: 20, sortBy: "dueDate", sortOrder: "asc" })
  const tasksToApproveQuery = useSummaryTasksToApprove({ page: 1, pageSize: 20 }, allowed)
  const provisionsQuery = useSummaryProvisions()

  const processBatchMutation = useProcessSummaryBatch()
  const approveTaskMutation = useApproveSummaryTask()

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
    // AI action is a placeholder in this UI.
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
