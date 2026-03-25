"use client"

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Loader2, MessageCircleDashed, Sparkles, User2 } from "lucide-react"

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
import { getApiErrorMessage, isApiClientError } from "@/lib/api/error"
import { useAskAi } from "@/hooks/api/use-ai"
import type { AskAiResponse } from "@/services/ai.service"
import {
  useApproveSummaryTask,
  useProcessSummaryBatch,
  useRecordSummaryTaskReviewEvent,
  useSummaryProvisions,
  useSummaryStats,
  useSummaryTasksToApprove,
  useSummaryTaskToApproveDetail,
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

type AiChatRole = "user" | "assistant" | "system"

interface AiMessageMetadata {
  source: AskAiResponse["source"]
  model: AskAiResponse["model"]
  statsSource: AskAiResponse["statsSource"]
  generatedAt: AskAiResponse["generatedAt"]
}

interface AiChatMessage {
  id: string
  role: AiChatRole
  content: string
  createdAt: string
  meta?: AiMessageMetadata
  suggestions?: AskAiResponse["suggestions"]
}

export default function MySummaryPage() {
  const { user, logout } = useAuth()
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canApproveIOILogs")
  const [isAskAiOpen, setIsAskAiOpen] = useState(false)
  const [askAiQuery, setAskAiQuery] = useState("")
  const [askAiError, setAskAiError] = useState<string | null>(null)
  const [approvalFeedback, setApprovalFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [reviewedTaskIds, setReviewedTaskIds] = useState<Set<string>>(new Set())

  const statsQuery = useSummaryStats()
  const todosQuery = useSummaryTodos({ page: 1, pageSize: 20, sortBy: "dueDate", sortOrder: "asc" })
  const tasksToApproveQuery = useSummaryTasksToApprove({ page: 1, pageSize: 20 }, allowed)
  const provisionsQuery = useSummaryProvisions()

  const taskDetailQuery = useSummaryTaskToApproveDetail(detailTaskId ?? "", detailTaskId !== null)

  const processBatchMutation = useProcessSummaryBatch()
  const approveTaskMutation = useApproveSummaryTask()
  const recordReviewMutation = useRecordSummaryTaskReviewEvent()
  const askAiMutation = useAskAi()

  useEffect(() => {
    if (!isAskAiOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [chatMessages, isAskAiOpen, askAiMutation.isPending])

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
        reviewed: item.reviewedByCurrentUser === true || reviewedTaskIds.has(item.id),
        submitter: {
          name: submitter,
          initials: toInitials(submitter),
          color: colorFromString(submitter),
        },
      }
    })
  }, [tasksToApproveQuery.data?.items, reviewedTaskIds])

  const allTasksReviewed = approvalTasks.length > 0 && approvalTasks.every((t) => t.reviewed)

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
    const userMessage: AiChatMessage = {
      id: createChatMessageId(),
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    }
    const conversation = [...chatMessages, userMessage]
    setChatMessages((prev) => [...prev, userMessage])
    setAskAiQuery("")

    try {
      const response = await askAiMutation.mutateAsync({
        query: buildAskAiQuery(query, conversation),
        page: "summary",
        context: askAiContext,
      })

      const assistantMessage: AiChatMessage = {
        id: createChatMessageId(),
        role: "assistant",
        content: response.answer,
        createdAt: response.generatedAt,
        meta: {
          source: response.source,
          model: response.model,
          statsSource: response.statsSource,
          generatedAt: response.generatedAt,
        },
        suggestions: response.suggestions,
      }

      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      if (isApiClientError(error) && error.status === 401) {
        await logout()
        return
      }

      const message = getAskAiErrorMessage(error)
      setAskAiError(message)
      setChatMessages((prev) => [
        ...prev,
        {
          id: createChatMessageId(),
          role: "system",
          content: message,
          createdAt: new Date().toISOString(),
        },
      ])
    }
  }

  const handleAskAiSubmit = () => {
    void submitAskAi()
  }

  const handleAskAiKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return
    }

    event.preventDefault()
    void submitAskAi()
  }

  const handleSuggestionClick = (action: string) => {
    void submitAskAi(action)
  }

  const handleResetConversation = () => {
    setAskAiError(null)
    setChatMessages([])
    setAskAiQuery("")
  }

  const handleViewApproval = (id: string) => {
    setDetailTaskId(id)
    if (!reviewedTaskIds.has(id)) {
      recordReviewMutation.mutate(
        { taskId: id, payload: { action: "view_detail" } },
        {
          onSuccess: () => {
            setReviewedTaskIds((prev) => new Set(prev).add(id))
          },
        }
      )
    }
  }

  const handleApproveTask = (id: string) => {
    if (!reviewedTaskIds.has(id)) {
      setApprovalFeedback({
        type: "error",
        message: "You must review this task before approving. Click \"View\" first.",
      })
      return
    }

    guard(() => {
      setApprovalFeedback(null)
      approveTaskMutation.mutate(
        { taskId: id },
        {
          onSuccess: () => {
            setApprovalFeedback({
              type: "success",
              message: "Task approved successfully.",
            })
          },
          onError: (error) => {
            setApprovalFeedback({
              type: "error",
              message: getTaskApprovalErrorMessage(error),
            })
          },
        }
      )
    })
  }

  const handleProcessBatch = () => {
    if (!allTasksReviewed) {
      setApprovalFeedback({
        type: "error",
        message: "All tasks must be reviewed before batch processing. Click \"View\" on each task first.",
      })
      return
    }

    guard(() => {
      if (processBatchMutation.isPending) {
        return
      }

      const taskIds = approvalTasks.map((task) => task.id)
      if (taskIds.length === 0) return

      setApprovalFeedback(null)
      processBatchMutation.mutate(
        {
          taskIds,
          action: "approve",
        },
        {
          onSuccess: (result) => {
            if (result.failed.length > 0) {
              const firstFailure = result.failed[0]?.reason
              setApprovalFeedback({
                type: "error",
                message: firstFailure
                  ? `Processed ${result.processed} tasks. ${result.failed.length} failed: ${firstFailure}`
                  : `Processed ${result.processed} tasks. ${result.failed.length} could not be approved.`,
              })
              return
            }

            setApprovalFeedback({
              type: "success",
              message: `Processed ${result.processed} tasks successfully.`,
            })
          },
          onError: (error) => {
            setApprovalFeedback({
              type: "error",
              message: getTaskApprovalErrorMessage(error),
            })
          },
        }
      )
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

      <StatsOverview stats={stats} loading={statsQuery.isLoading} />

      <AccessBanner show={!allowed} message="You have view-only access to approval actions on this page." />

      {approvalFeedback ? (
        <div
          className={
            approvalFeedback.type === "error"
              ? "p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
              : "p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg"
          }
        >
          {approvalFeedback.message}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-6">
        <TodoList items={todoItems} />
        <TasksToApprove
          items={approvalTasks}
          onView={handleViewApproval}
          onApprove={allowed ? handleApproveTask : undefined}
          onProcessBatch={allowed ? handleProcessBatch : undefined}
          allReviewed={allTasksReviewed}
        />
      </div>

      <Provisions homes={homeProvisions} />

      {/* Task Detail Modal */}
      <Dialog open={detailTaskId !== null} onOpenChange={(open) => { if (!open) setDetailTaskId(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Detail</DialogTitle>
            <DialogDescription>
              Review the task details before approving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {taskDetailQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : taskDetailQuery.data ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Title</span>
                    <span className="font-medium text-right">{taskDetailQuery.data.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Related To</span>
                    <span className="font-medium">{taskDetailQuery.data.relation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority</span>
                    <span className="font-medium">{taskDetailQuery.data.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant="outline">{taskDetailQuery.data.approvalStatus}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assignee</span>
                    <span className="font-medium">{taskDetailQuery.data.assignee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium">{formatDate(taskDetailQuery.data.dueDate)}</span>
                  </div>
                  {taskDetailQuery.data.labels.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">Labels</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {taskDetailQuery.data.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {taskDetailQuery.data.reviewedByCurrentUser && (
                    <div className="p-2 rounded bg-emerald-50 text-emerald-700 text-xs">
                      You have reviewed this task{taskDetailQuery.data.reviewedAt ? ` at ${formatDateTime(taskDetailQuery.data.reviewedAt)}` : ""}.
                    </div>
                  )}
                </div>
              </>
            ) : taskDetailQuery.error ? (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {getErrorMessage(taskDetailQuery.error) ?? "Failed to load task details."}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTaskId(null)}>Close</Button>
            {detailTaskId && allowed && reviewedTaskIds.has(detailTaskId) && (
              <Button
                onClick={() => {
                  handleApproveTask(detailTaskId)
                  setDetailTaskId(null)
                }}
                disabled={approveTaskMutation.isPending}
              >
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAskAiOpen} onOpenChange={setIsAskAiOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden gap-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 px-6 pt-6">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              Ask AI
            </DialogTitle>
            <DialogDescription className="px-6 pb-4">
              Ask for a priority summary, blockers, or next actions based on your current dashboard data.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-[radial-gradient(circle_at_12%_20%,rgba(249,115,22,0.08),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(16,185,129,0.09),transparent_30%),linear-gradient(180deg,#ffffff,#f8fafc)] p-3">
              <div className="max-h-[26rem] overflow-y-auto space-y-3 pr-1">
                {chatMessages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white/80 p-5 text-center">
                    <MessageCircleDashed className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 font-medium">Start a conversation</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ask anything about your summary and keep following up.
                    </p>
                  </div>
                )}

                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : message.role === "assistant"
                          ? "justify-start"
                          : "justify-center"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="max-w-[86%] rounded-2xl rounded-br-md bg-primary text-white px-4 py-3 shadow-sm">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-white/80">
                          <User2 className="h-3.5 w-3.5" />
                          You
                        </div>
                        <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ) : message.role === "assistant" ? (
                      <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm space-y-3">
                        {message.meta && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={message.meta.source === "model" ? "default" : "outline"}>
                              {message.meta.source === "model" ? "Model" : "Fallback"}
                            </Badge>
                            <Badge variant="outline">Stats: {message.meta.statsSource}</Badge>
                            {message.meta.model ? <Badge variant="outline">{message.meta.model}</Badge> : null}
                          </div>
                        )}

                        <FormattedAiContent content={message.content} />

                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={`${message.id}-${suggestion.action}-${index}`}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuggestionClick(suggestion.action)}
                                disabled={askAiMutation.isPending}
                                className="bg-white"
                              >
                                {suggestion.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-gray-500">
                          {message.meta?.generatedAt
                            ? `Generated at ${formatDateTime(message.meta.generatedAt)}`
                            : `Sent at ${formatDateTime(message.createdAt)}`}
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-[92%] rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                        {message.content}
                      </div>
                    )}
                  </div>
                ))}

                {askAiMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                value={askAiQuery}
                onChange={(event) => setAskAiQuery(event.target.value)}
                onKeyDown={handleAskAiKeyDown}
                placeholder="Ask a question... (Enter to send, Shift+Enter for newline)"
                className="min-h-20 max-h-48 resize-y"
                maxLength={1200}
              />

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Conversation stays active while this window is open.</span>
                <span>{askAiQuery.length}/1200</span>
              </div>

              {askAiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {askAiError}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50/70">
            <Button
              variant="ghost"
              type="button"
              onClick={handleResetConversation}
              disabled={askAiMutation.isPending || chatMessages.length === 0}
            >
              New Chat
            </Button>
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
  return getApiErrorMessage(error, "Unable to load data from the backend.")
}

function getAskAiErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    if (error.status === 400 || error.status === 422) {
      return "Your prompt was invalid. Please enter a clearer question."
    }

    if (error.status === 429) {
      return getApiErrorMessage(error, "Too many AI requests. Please wait a moment and try again.")
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

function getTaskApprovalErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    if (error.code === "REVIEW_REQUIRED_BEFORE_ACKNOWLEDGE") {
      return "You must review this task before approving. Click \"View\" first."
    }

    if (error.code === "TASK_APPROVAL_STATE_FORBIDDEN") {
      return "This task cannot be approved in its current state."
    }

    if (error.code === "TASK_ASSIGN_FORBIDDEN") {
      return "You are not allowed to approve this task assignment."
    }

    if (error.code === "INVALID_TASK_STATE") {
      return "This task is not in an approvable state."
    }

    if (error.code === "MFA_REQUIRED") {
      return "Additional verification (MFA) is required to approve this task."
    }
  }

  return getApiErrorMessage(error, "Unable to process task approval.")
}

function createChatMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildAskAiQuery(query: string, conversation: AiChatMessage[]): string {
  const recentTurns = conversation
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: compactText(message.content, 350),
    }))

  if (recentTurns.length === 0) {
    return query
  }

  const history = recentTurns
    .map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`)
    .join("\n")

  return [
    "Use the recent conversation context to answer the latest user question.",
    "Conversation:",
    history,
    "",
    `Latest question: ${query}`,
  ].join("\n")
}

function compactText(value: string, limit: number): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= limit) {
    return normalized
  }
  return `${normalized.slice(0, limit)}...`
}

type AiRenderedBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "label"; label: string; body?: string }

function parseAiContent(content: string): AiRenderedBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: AiRenderedBlock[] = []
  let index = 0

  while (index < lines.length) {
    const currentLine = lines[index].trim()

    if (!currentLine) {
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(currentLine)) {
      const items: string[] = []
      while (index < lines.length) {
        const line = lines[index].trim()
        const match = line.match(/^[-*]\s+(.*)$/)
        if (!match) break
        items.push(match[1].trim())
        index += 1
      }

      if (items.length > 0) {
        blocks.push({ type: "bullets", items })
      }
      continue
    }

    const labelMatch = currentLine.match(/^\*\*(.+?)\*\*:?\s*(.*)$/)
    if (labelMatch) {
      blocks.push({
        type: "label",
        label: labelMatch[1].trim(),
        body: labelMatch[2].trim() || undefined,
      })
      index += 1
      continue
    }

    let paragraph = currentLine
    index += 1
    while (index < lines.length) {
      const nextLine = lines[index].trim()
      if (!nextLine || /^[-*]\s+/.test(nextLine) || /^\*\*(.+?)\*\*:?\s*(.*)$/.test(nextLine)) {
        break
      }

      paragraph = `${paragraph} ${nextLine}`
      index += 1
    }

    blocks.push({ type: "paragraph", text: paragraph })
  }

  return blocks
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, index) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/)
    if (match) {
      return (
        <strong key={`strong-${index}`} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      )
    }

    return <Fragment key={`text-${index}`}>{part}</Fragment>
  })
}

function FormattedAiContent({ content }: { content: string }) {
  const blocks = parseAiContent(content)

  return (
    <div className="space-y-3 text-sm leading-6 text-gray-800">
      {blocks.map((block, index) => {
        if (block.type === "label") {
          return (
            <p key={`label-${index}`} className="text-sm leading-6">
              <span className="font-semibold text-gray-900">{block.label}:</span>{" "}
              {block.body ? renderInlineFormatting(block.body) : null}
            </p>
          )
        }

        if (block.type === "bullets") {
          return (
            <ul key={`bullets-${index}`} className="space-y-1.5 pl-5 list-disc marker:text-primary/70">
              {block.items.map((item, itemIndex) => (
                <li key={`bullet-${index}-${itemIndex}`}>{renderInlineFormatting(item)}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`paragraph-${index}`} className="text-sm leading-6">
            {renderInlineFormatting(block.text)}
          </p>
        )
      })}
    </div>
  )
}
