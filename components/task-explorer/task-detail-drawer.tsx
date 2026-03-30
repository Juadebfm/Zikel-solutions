"use client"

import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  UserPlus,
  Loader2,
  Paperclip,
  Calendar,
  User2,
  AlertTriangle,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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
  onAction?: (taskId: string, action: string) => void
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

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  try {
    return dateFormatter.format(new Date(value))
  } catch {
    return "-"
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusVariantMap: Record<string, string> = {
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  sent_for_approval: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

const priorityVariantMap: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const approvalStatusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 className="size-4 text-green-600" />,
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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            <AlertTriangle className="size-10 text-destructive" />
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
            <SheetHeader className="border-b px-6 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <SheetTitle className="text-lg leading-snug">
                    {task.title}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Task detail view for {task.title}
                  </SheetDescription>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="outline" className="font-mono text-xs">
                  {task.taskRef}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs capitalize",
                    statusVariantMap[task.status] ?? statusVariantMap.draft
                  )}
                >
                  {task.statusLabel}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs capitalize",
                    priorityVariantMap[task.priority] ?? priorityVariantMap.medium
                  )}
                >
                  {task.priority}
                </Badge>
              </div>
            </SheetHeader>

            {/* ── Body ──────────────────────────────────── */}
            <ScrollArea className="flex-1">
              <div className="space-y-5 px-6 py-4">
                {/* Description */}
                {task.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <InfoField
                    icon={<User2 className="size-4" />}
                    label="Assignee"
                    value={task.assignee?.name ?? "-"}
                  />
                  <InfoField
                    icon={<User2 className="size-4" />}
                    label="Created By"
                    value={task.createdBy?.name ?? "-"}
                  />
                  <InfoField
                    icon={<Calendar className="size-4" />}
                    label="Due Date"
                    value={formatDate(task.dueAt)}
                  />
                  <InfoField
                    icon={<FileText className="size-4" />}
                    label="Category"
                    value={task.categoryLabel}
                  />
                  <InfoField
                    icon={<FileText className="size-4" />}
                    label="Entity"
                    value={task.relatedEntity?.name ?? "-"}
                  />
                  <InfoField
                    icon={<Calendar className="size-4" />}
                    label="Submitted At"
                    value={formatDate(task.submittedAt)}
                  />
                </div>

                <Separator />

                {/* Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="details" className="flex-1">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1">
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="flex-1">
                      Comments
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Details Tab ──────────────────────── */}
                  <TabsContent value="details" className="space-y-4 pt-3">
                    {/* Attachments */}
                    <Section title="Attachments">
                      {task.attachments.length === 0 ? (
                        <EmptyState text="No attachments" />
                      ) : (
                        <ul className="space-y-2">
                          {task.attachments.map((file: TaskAttachment) => (
                            <li
                              key={file.id}
                              className="flex items-center gap-2 rounded-md border p-2 text-sm"
                            >
                              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1 truncate">
                                {file.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.sizeBytes)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Section>

                    {/* Approval Chain */}
                    <Section title="Approval Chain">
                      {task.approvalChain.length === 0 ? (
                        <EmptyState text="No approval chain" />
                      ) : (
                        <ul className="space-y-2">
                          {task.approvalChain.map(
                            (entry: TaskApprovalChainEntry) => (
                              <li
                                key={entry.userId}
                                className="flex items-center gap-3 text-sm"
                              >
                                <Avatar className="size-7">
                                  <AvatarImage
                                    src={entry.avatarUrl ?? undefined}
                                    alt={entry.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(entry.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {entry.name}
                                  </span>
                                  {entry.comment && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {entry.comment}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {approvalStatusIcon[entry.status]}
                                  <span className="text-xs capitalize text-muted-foreground">
                                    {entry.status}
                                  </span>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </Section>

                    {/* Form Data */}
                    {task.formData &&
                      Object.keys(task.formData).length > 0 && (
                        <Section title="Form Data">
                          <div className="space-y-1 text-sm">
                            {Object.entries(task.formData).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between gap-2"
                                >
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-right font-medium">
                                    {String(value ?? "-")}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </Section>
                      )}
                  </TabsContent>

                  {/* ── Activity Tab ─────────────────────── */}
                  <TabsContent value="activity" className="pt-3">
                    {task.activityLog.length === 0 ? (
                      <EmptyState text="No activity yet" />
                    ) : (
                      <ul className="relative space-y-4 border-l border-border pl-4">
                        {task.activityLog.map((entry: TaskActivityEntry) => (
                          <li key={entry.id} className="relative text-sm">
                            <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-muted-foreground" />
                            <p className="font-medium">{entry.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.by} &middot; {formatDate(entry.at)}
                            </p>
                            {entry.note && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {entry.note}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>

                  {/* ── Comments Tab ─────────────────────── */}
                  <TabsContent value="comments" className="pt-3">
                    {task.comments.length === 0 ? (
                      <EmptyState text="No comments yet" />
                    ) : (
                      <ul className="space-y-3">
                        {task.comments.map((comment: TaskComment) => (
                          <li
                            key={comment.id}
                            className="flex gap-3 text-sm"
                          >
                            <Avatar className="size-7 shrink-0">
                              <AvatarImage
                                src={comment.by.avatarUrl ?? undefined}
                                alt={comment.by.name}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(comment.by.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="font-medium">
                                  {comment.by.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.at)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-muted-foreground">
                                {comment.text}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            {/* ── Footer ────────────────────────────────── */}
            {onAction && (
              <div className="border-t px-6 py-3 flex items-center gap-2 flex-wrap">
                {canApprove && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onAction(task.id, "approve")}
                  >
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Approve
                  </Button>
                )}
                {canReject && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onAction(task.id, "reject")}
                  >
                    <XCircle className="mr-1.5 size-4" />
                    Reject
                  </Button>
                )}
                {canReassign && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(task.id, "reassign")}
                  >
                    <UserPlus className="mr-1.5 size-4" />
                    Reassign
                  </Button>
                )}
                {canComment && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(task.id, "comment")}
                  >
                    <MessageSquare className="mr-1.5 size-4" />
                    Comment
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-xs text-muted-foreground py-2 text-center">{text}</p>
  )
}
