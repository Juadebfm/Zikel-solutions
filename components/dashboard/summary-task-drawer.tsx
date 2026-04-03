"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"
import {
  CheckCircle2,
  FileText,
  ListChecks,
  MessageSquare,
  Paperclip,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type {
  SummaryTaskActivityEntry,
  SummaryTaskAuditTrailEntry,
  SummaryTaskComment,
  SummaryTaskItem,
} from "@/services/summary.service"

interface SummaryTaskDrawerProps {
  task: SummaryTaskItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve?: (taskId: string) => void
  resolving?: boolean
}

const priorityBadgeClass: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return format(date, "dd MMM yyyy, HH:mm")
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes || Number.isNaN(bytes)) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCommentAuthor(by: SummaryTaskComment["by"]): string {
  if (!by) return "Unknown"
  if (typeof by === "string") return by
  return by.name || "Unknown"
}

function formatActivityBy(entry: SummaryTaskActivityEntry): string {
  const by = entry.by
  if (!by) return "System"
  if (typeof by === "string") return by
  if (typeof by === "object" && by !== null && "name" in by) return String((by as { name?: string }).name || "System")
  return String(by)
}

function safeString(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined) return fallback
  if (typeof value === "string") return value || fallback
  if (typeof value === "object" && "name" in (value as Record<string, unknown>)) return String((value as { name?: string }).name || fallback)
  return String(value)
}

function toAuditLabel(entry: SummaryTaskAuditTrailEntry): string {
  const field = entry.field || "Field"
  const from = safeString(entry.from)
  const to = safeString(entry.to)
  return `${field}: ${from} -> ${to}`
}

export function SummaryTaskDrawer({
  task,
  open,
  onOpenChange,
  onResolve,
  resolving = false,
}: SummaryTaskDrawerProps) {
  const canResolve = Boolean(task && (task.status === "pending" || task.status === "in_progress"))
  const attachments = task?.attachments ?? []
  const approvalChain = task?.approvalChain ?? []
  const activityLog = task?.activityLog ?? []
  const comments = task?.comments ?? []
  const auditTrail = task?.auditTrail ?? []
  const formDataEntries = task?.formData && typeof task.formData === "object"
    ? Object.entries(task.formData)
    : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetTitle className="sr-only">
          {task ? `Task detail: ${task.title}` : "Task detail"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {task ? `Summary task details for ${task.title}` : "Summary task detail drawer"}
        </SheetDescription>

        {!task ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            This task is not available in the current list view.
          </div>
        ) : (
          <>
            <div className="px-6 py-5 border-b space-y-3">
              <p className="text-xl font-semibold leading-tight pr-8">{task.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{task.taskRef}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{task.statusLabel ?? task.status}</Badge>
                <Badge className={cn("text-xs capitalize", priorityBadgeClass[task.priority] ?? "bg-gray-100 text-gray-700")}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {task.approvalStatusLabel ?? task.approvalStatus}
                </Badge>
              </div>
              {task.description ? (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              ) : null}
            </div>

            <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
                  <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <Field label="Related To" value={task.relatedEntity?.name ?? "-"} />
                    <Field label="Category" value={task.categoryLabel || task.domain || "-"} />
                    <Field label="Due Date" value={formatDateTime(task.dueAt)} />
                    <Field label="Submitted" value={formatDateTime(task.submittedAt)} />
                    <Field label="Assignee" value={task.assignee?.name ?? "Unassigned"} />
                    <Field label="Created By" value={task.createdBy?.name ?? "-"} />
                  </div>

                  <SectionTitle icon={<ListChecks className="h-4 w-4" />} label="Approval Chain" />
                  {approvalChain.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No approval chain data.</p>
                  ) : (
                    <div className="space-y-2">
                      {approvalChain.map((entry, index) => (
                        <div key={entry.userId ?? `${entry.name ?? "entry"}-${index}`} className="rounded-md border p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{entry.name ?? "Unknown"}</p>
                            <Badge variant="outline" className="text-[11px] capitalize">{entry.status ?? "pending"}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(entry.respondedAt)}
                          </p>
                          {entry.comment ? <p className="text-xs mt-1">{entry.comment}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}

                  <SectionTitle icon={<FileText className="h-4 w-4" />} label="Form Data" />
                  {formDataEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No form data.</p>
                  ) : (
                    <div className="space-y-2">
                      {formDataEntries.map(([key, value]) => (
                        <div key={key} className="rounded-md border p-3 text-sm">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{key}</p>
                          <p className="mt-1 break-words">{formatValue(value)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-0 space-y-4">
                  <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />} label="Activity Log" />
                  {activityLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {activityLog.map((entry, index) => (
                        <div key={entry.id ?? `${entry.action ?? "activity"}-${index}`} className="rounded-md border p-3 text-sm">
                          <p className="font-medium capitalize">{entry.action ?? "update"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {formatActivityBy(entry)} at {formatDateTime(entry.at)}
                          </p>
                          {entry.note ? <p className="text-xs mt-1">{entry.note}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}

                  <SectionTitle icon={<ListChecks className="h-4 w-4" />} label="Audit Trail" />
                  {auditTrail.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No audit entries.</p>
                  ) : (
                    <div className="space-y-2">
                      {auditTrail.map((entry, index) => (
                        <div key={`${entry.field ?? "audit"}-${index}`} className="rounded-md border p-3 text-sm">
                          <p className="font-medium">{toAuditLabel(entry)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {safeString(entry.by, "System")} at {formatDateTime(entry.at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="mt-0 space-y-2">
                  <SectionTitle icon={<MessageSquare className="h-4 w-4" />} label="Comments" />
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments.</p>
                  ) : (
                    comments.map((comment, index) => (
                      <div key={comment.id ?? `comment-${index}`} className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{formatCommentAuthor(comment.by)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(comment.at)}</p>
                        <p className="mt-2 whitespace-pre-wrap">{comment.text || "-"}</p>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="files" className="mt-0 space-y-2">
                  <SectionTitle icon={<Paperclip className="h-4 w-4" />} label="Attachments" />
                  {attachments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attachments.</p>
                  ) : (
                    attachments.map((file, index) => (
                      <div key={String(file.id ?? `${file.name ?? "file"}-${index}`)} className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{String(file.name ?? "Attachment")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {String(file.contentType ?? "file")} · {formatFileSize(typeof file.sizeBytes === "number" ? file.sizeBytes : undefined)}
                        </p>
                      </div>
                    ))
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="border-t px-6 py-3 flex items-center justify-end gap-2">
              {canResolve && onResolve ? (
                <Button onClick={() => onResolve(task.id)} disabled={resolving}>
                  {resolving ? "Resolving..." : "Resolve Now"}
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Completed
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "-"}</p>
    </div>
  )
}

function SectionTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "string") return value.trim() || "-"
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    return value.map((entry) => formatValue(entry)).filter((entry) => entry !== "-").join(", ") || "-"
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return "-"
    }
  }
  return "-"
}
