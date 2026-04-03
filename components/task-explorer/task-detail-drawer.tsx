"use client"

import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  UserPlus,
  Paperclip,
  Calendar,
  User2,
  AlertTriangle,
  Send,
  Building2,
  Tag,
  Download,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import type {
  TaskDetail,
  TaskAttachment,
  TaskApprovalChainEntry,
  TaskActivityEntry,
  TaskComment,
} from "@/services/tasks.service"
import { useTaskDetail } from "@/hooks/api/use-tasks"

// ─── Props ───────────────────────────────────────────────────────

interface TaskDetailDrawerProps {
  taskId: string | null
  open: boolean
  onClose: () => void
  onAction?: (
    taskId: string,
    action: string,
    options?: { comment?: string }
  ) => void
}

// ─── Helpers ─────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  try {
    return dateFormatter.format(new Date(value))
  } catch {
    return "-"
  }
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "-"
  try {
    return shortDateFormatter.format(new Date(value))
  } catch {
    return "-"
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatRelativeTime(value: string): string {
  const now = Date.now()
  const then = new Date(value).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return formatShortDate(value)
}

function formatFieldLabel(key: string): string {
  const normalized = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function formatFormValue(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return "-"

  if (typeof value === "string") {
    const text = value.trim()
    return text.length > 0 ? text : "-"
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => formatFormValue(entry, depth + 1))
      .filter((entry) => entry !== "-")

    return parts.length > 0 ? parts.join(", ") : "-"
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>

    // Prefer human-friendly object fields when available.
    const preferredKeys = ["label", "name", "title", "value", "text"]
    for (const key of preferredKeys) {
      const candidate = record[key]
      if (isNonEmptyString(candidate)) return candidate
      if (typeof candidate === "number" || typeof candidate === "boolean") {
        return String(candidate)
      }
    }

    if (depth >= 2) return "-"

    const entries = Object.entries(record)
      .map(([key, nestedValue]) => {
        const nested = formatFormValue(nestedValue, depth + 1)
        return nested === "-" ? null : `${formatFieldLabel(key)}: ${nested}`
      })
      .filter((entry): entry is string => entry !== null)

    return entries.length > 0 ? entries.join(" | ") : "-"
  }

  return "-"
}

// ─── Status / Priority styling ───────────────────────────────────

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-l-emerald-500" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-l-red-500" },
  submitted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-l-blue-500" },
  sent_for_approval: { bg: "bg-amber-50", text: "text-amber-700", border: "border-l-amber-500" },
  draft: { bg: "bg-gray-50", text: "text-gray-700", border: "border-l-gray-400" },
  deleted: { bg: "bg-gray-50", text: "text-gray-500", border: "border-l-gray-300" },
  deleted_draft: { bg: "bg-gray-50", text: "text-gray-500", border: "border-l-gray-300" },
  hidden: { bg: "bg-gray-50", text: "text-gray-500", border: "border-l-gray-300" },
}

const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  medium: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  high: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  urgent: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
}

const activityDotColor: Record<string, string> = {
  approve: "bg-emerald-500",
  approved: "bg-emerald-500",
  reject: "bg-red-500",
  rejected: "bg-red-500",
  submit: "bg-blue-500",
  submitted: "bg-blue-500",
  comment: "bg-gray-400",
  reassign: "bg-amber-500",
  create: "bg-primary",
  created: "bg-primary",
}

const approvalStatusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 className="size-4 text-emerald-600" />,
  rejected: <XCircle className="size-4 text-red-600" />,
  pending: <Clock className="size-4 text-amber-500" />,
}

// ─── Component ───────────────────────────────────────────────────

export function TaskDetailDrawer({
  taskId,
  open,
  onClose,
  onAction,
}: TaskDetailDrawerProps) {
  const [commentText, setCommentText] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useTaskDetail(taskId ?? "", open && Boolean(taskId))

  const canApprove =
    task?.status === "sent_for_approval" || task?.approvalStatus === "pending_approval"
  const canReject = canApprove
  const canReassign =
    task?.status !== "approved" &&
    task?.status !== "rejected" &&
    task?.status !== "deleted"
  const canComment =
    task?.status !== "deleted" && task?.status !== "deleted_draft"
  const hasActions = canApprove || canReject || canReassign

  const status = statusConfig[task?.status ?? "draft"] ?? statusConfig.draft
  const priority = priorityConfig[task?.priority ?? "medium"] ?? priorityConfig.medium

  function handleComment() {
    if (!task || !commentText.trim() || !onAction) return
    onAction(task.id, "comment", { comment: commentText.trim() })
    setCommentText("")
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-xl flex flex-col p-0 gap-0",
          task && `border-l-4 ${status.border}`
        )}
      >
        <SheetTitle className="sr-only">
          {task ? `Task detail: ${task.title}` : "Task detail"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {task ? `Task detail view for ${task.title}` : "Task detail view"}
        </SheetDescription>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col flex-1">
            {/* Header skeleton */}
            <div className="px-6 pt-5 pb-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Metadata card skeleton */}
            <div className="mx-6 rounded-lg bg-muted/50 border p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="px-6 pt-4 space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-md border p-3 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            <div className="rounded-full bg-red-50 p-3">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {(error as Error)?.message ?? "Failed to load task details."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {task && !isLoading && !isError && (
          <>
            {/* ── Header ────────────────────────────────── */}
            <div className="px-6 pt-5 pb-4 space-y-3">
              <h2 className="text-xl font-semibold leading-tight pr-8">
                {task.title}
              </h2>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                  {task.taskRef}
                </Badge>
                <Badge className={cn("text-xs capitalize px-2.5 py-0.5", status.bg, status.text)}>
                  {task.statusLabel}
                </Badge>
                <Badge className={cn("text-xs capitalize px-2.5 py-0.5 gap-1.5", priority.bg, priority.text)}>
                  <span className={cn("size-1.5 rounded-full", priority.dot)} />
                  {task.priority}
                </Badge>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            {/* ── Metadata Card ─────────────────────────── */}
            <div className="mx-6 rounded-lg bg-muted/50 border p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetaField
                  icon={<User2 className="size-3.5" />}
                  label="Assignee"
                >
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        {task.assignee.avatarUrl && (
                          <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {getInitials(task.assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </MetaField>

                <MetaField
                  icon={<User2 className="size-3.5" />}
                  label="Created By"
                >
                  {task.createdBy ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        {task.createdBy.avatarUrl && (
                          <AvatarImage src={task.createdBy.avatarUrl} alt={task.createdBy.name} />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {getInitials(task.createdBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{task.createdBy.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </MetaField>

                <MetaField
                  icon={<Calendar className="size-3.5" />}
                  label="Due Date"
                >
                  <span className="text-sm font-medium">{formatDate(task.dueAt)}</span>
                </MetaField>

                <MetaField
                  icon={<Tag className="size-3.5" />}
                  label="Category"
                >
                  <span className="text-sm font-medium">{task.categoryLabel}</span>
                </MetaField>

                <MetaField
                  icon={<Building2 className="size-3.5" />}
                  label="Entity"
                >
                  <span className="text-sm font-medium">{task.relatedEntity?.name ?? "-"}</span>
                </MetaField>

                <MetaField
                  icon={<Calendar className="size-3.5" />}
                  label="Submitted At"
                >
                  <span className="text-sm font-medium">{formatDate(task.submittedAt)}</span>
                </MetaField>
              </div>
            </div>

            {/* ── Sticky Tabs ───────────────────────────── */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col min-h-0 mt-4"
            >
              <div className="px-6 border-b">
                <TabsList className="w-full bg-transparent h-auto p-0 gap-0">
                  <TabsTrigger
                    value="details"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2.5 pt-1 text-sm"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2.5 pt-1 text-sm"
                  >
                    Activity
                    {task.activityLog.length > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({task.activityLog.length})
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2.5 pt-1 text-sm"
                  >
                    Comments
                    {task.comments.length > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({task.comments.length})
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Scrollable tab content */}
              <ScrollArea className="flex-1 min-h-0">
                {/* ── Details Tab ──────────────────────── */}
                <TabsContent value="details" className="mt-0 px-6 py-4 space-y-5">
                  {/* Attachments */}
                  <Section title="Attachments" count={task.attachments.length}>
                    {task.attachments.length === 0 ? (
                      <EmptyBlock icon={<Paperclip className="size-5" />} text="No attachments" />
                    ) : (
                      <div className="space-y-2">
                        {task.attachments.map((file: TaskAttachment) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 rounded-lg border bg-white p-3 hover:bg-muted/30 transition-colors group"
                          >
                            <div className="flex items-center justify-center size-9 rounded-lg bg-muted shrink-0">
                              <FileText className="size-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.sizeBytes)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>

                  {/* Approval Chain */}
                  <Section title="Approval Chain" count={task.approvalChain.length}>
                    {task.approvalChain.length === 0 ? (
                      <EmptyBlock icon={<CheckCircle2 className="size-5" />} text="No approval chain" />
                    ) : (
                      <div className="space-y-1">
                        {task.approvalChain.map(
                          (entry: TaskApprovalChainEntry, index: number) => (
                            <div
                              key={entry.userId}
                              className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/30 transition-colors"
                            >
                              <div className="relative">
                                <Avatar className="size-8">
                                  <AvatarImage
                                    src={entry.avatarUrl ?? undefined}
                                    alt={entry.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(entry.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-0.5 -right-0.5">
                                  {approvalStatusIcon[entry.status]}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{entry.name}</p>
                                {entry.comment && (
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    &ldquo;{entry.comment}&rdquo;
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] capitalize px-2 py-0.5",
                                    entry.status === "approved" && "bg-emerald-50 text-emerald-700",
                                    entry.status === "rejected" && "bg-red-50 text-red-700",
                                    entry.status === "pending" && "bg-amber-50 text-amber-700"
                                  )}
                                >
                                  {entry.status}
                                </Badge>
                                {entry.respondedAt && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {formatRelativeTime(entry.respondedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </Section>

                  {/* Form Data */}
                  {task.formData && Object.keys(task.formData).length > 0 && (
                    <Section title="Form Data">
                      <div className="rounded-lg border divide-y">
                        {Object.entries(task.formData).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between gap-4 px-3 py-2.5 text-sm"
                          >
                            <span className="text-muted-foreground capitalize">
                              {formatFieldLabel(key)}
                            </span>
                            <span className="font-medium text-right">
                              {formatFormValue(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}
                </TabsContent>

                {/* ── Activity Tab ─────────────────────── */}
                <TabsContent value="activity" className="mt-0 px-6 py-4">
                  {task.activityLog.length === 0 ? (
                    <EmptyBlock icon={<Clock className="size-5" />} text="No activity yet" />
                  ) : (
                    <div className="relative pl-6">
                      {/* Timeline line */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                      <div className="space-y-4">
                        {task.activityLog.map((entry: TaskActivityEntry) => {
                          const dotColor =
                            activityDotColor[entry.action.toLowerCase()] ?? "bg-gray-400"

                          return (
                            <div key={entry.id} className="relative">
                              {/* Colored dot */}
                              <span
                                className={cn(
                                  "absolute -left-6 top-1.5 size-[9px] rounded-full ring-2 ring-white",
                                  dotColor
                                )}
                              />
                              <div>
                                <p className="text-sm font-medium">{entry.action}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs text-muted-foreground">
                                    {entry.by}
                                  </span>
                                  <span className="text-xs text-muted-foreground/50">&middot;</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(entry.at)}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5 inline-block">
                                    {entry.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ── Comments Tab ─────────────────────── */}
                <TabsContent value="comments" className="mt-0 px-6 py-4">
                  {task.comments.length === 0 && (
                    <EmptyBlock icon={<MessageSquare className="size-5" />} text="No comments yet" />
                  )}

                  {task.comments.length > 0 && (
                    <div className="space-y-4">
                      {task.comments.map((comment: TaskComment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="size-8 shrink-0 mt-0.5">
                            <AvatarImage
                              src={comment.by.avatarUrl ?? undefined}
                              alt={comment.by.name}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(comment.by.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="rounded-lg bg-muted/50 border px-3 py-2.5">
                              <div className="flex items-baseline justify-between gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.by.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {formatRelativeTime(comment.at)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* ── Footer ────────────────────────────────── */}
            <div className="border-t bg-white">
              {/* Action buttons for approval tasks */}
              {onAction && hasActions && (
                <div className="px-6 pt-3 pb-2 flex items-center gap-2">
                  {canApprove && (
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      onClick={() => onAction(task.id, "approve")}
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </Button>
                  )}
                  {canReject && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-1.5"
                      onClick={() => onAction(task.id, "reject")}
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  )}
                  {canReassign && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => onAction(task.id, "reassign")}
                    >
                      <UserPlus className="size-4" />
                      Reassign
                    </Button>
                  )}
                </div>
              )}

              {/* Inline comment input */}
              {onAction && canComment && (
                <div className="px-6 py-3">
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="min-h-[40px] max-h-[120px] resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleComment()
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="size-10 shrink-0"
                      disabled={!commentText.trim()}
                      onClick={handleComment}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function MetaField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">{title}</h4>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function EmptyBlock({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <div className="rounded-full bg-muted p-3 mb-2">
        {icon}
      </div>
      <p className="text-xs">{text}</p>
    </div>
  )
}
