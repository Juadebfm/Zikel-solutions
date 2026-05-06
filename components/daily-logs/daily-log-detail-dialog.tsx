"use client"

import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Home,
  Loader2,
  Tag,
  User2,
  Users,
  Sparkles,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { useDailyLogDetail } from "@/hooks/api/use-daily-logs"

// ─── Props ───────────────────────────────────────────────────────

interface DailyLogDetailDialogProps {
  logId: string | null
  open: boolean
  onClose: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return dateTimeFormatter.format(d)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return dateFormatter.format(d)
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700" },
  submitted: { bg: "bg-blue-50", text: "text-blue-700" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700" },
  rejected: { bg: "bg-red-50", text: "text-red-700" },
  draft: { bg: "bg-gray-50", text: "text-gray-700" },
}

// ─── Component ───────────────────────────────────────────────────

export function DailyLogDetailDialog({
  logId,
  open,
  onClose,
}: DailyLogDetailDialogProps) {
  const {
    data: log,
    isLoading,
    isError,
    error,
    refetch,
  } = useDailyLogDetail(logId ?? "", open && Boolean(logId))

  const status = statusConfig[log?.status ?? "draft"] ?? statusConfig.draft

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
            <div className="rounded-full bg-red-50 p-3">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {(error as Error)?.message ?? "Failed to load daily log."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {log && !isLoading && !isError && (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <DialogTitle className="text-lg leading-tight pr-8">
                    {log.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Daily log detail view
                  </DialogDescription>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.taskRef}
                    </Badge>
                    <Badge className={cn("text-xs capitalize", status.bg, status.text)}>
                      {log.statusLabel ?? log.status}
                    </Badge>
                    {log.categoryLabel && (
                      <Badge variant="secondary" className="text-xs">
                        {log.categoryLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {/* Body */}
            <ScrollArea className="max-h-[60vh]">
              <div className="px-6 py-5 space-y-5">
                {/* Metadata grid */}
                <div className="rounded-lg bg-muted/50 border p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetaItem
                      icon={<Home className="size-3.5" />}
                      label="Home"
                      value={log.title.split("—")[1]?.trim()?.split("—")[0]?.trim() ?? "-"}
                    />
                    <MetaItem
                      icon={<Users className="size-3.5" />}
                      label="Relates To"
                      value={
                        log.relatedEntity
                          ? `${log.relatedEntity.name} (${log.typeLabel ?? log.relatedEntity.type})`
                          : "-"
                      }
                    />
                    <MetaItem
                      icon={<Tag className="size-3.5" />}
                      label="Category"
                      value={log.submissionPayload?.dailyLogCategory ?? log.category ?? "-"}
                    />
                    <MetaItem
                      icon={<Calendar className="size-3.5" />}
                      label="Note Date"
                      value={formatDateTime(log.submissionPayload?.noteDate ?? log.dueAt)}
                    />
                    <MetaItem
                      icon={<User2 className="size-3.5" />}
                      label="Submitted By"
                      value={log.createdBy?.name ?? "-"}
                    />
                    <MetaItem
                      icon={<Clock className="size-3.5" />}
                      label="Submitted At"
                      value={formatDateTime(log.submittedAt ?? log.timestamps?.createdAt)}
                    />
                    {log.formTemplateKey && (
                      <MetaItem
                        icon={<Sparkles className="size-3.5" />}
                        label="Trigger Task"
                        value={log.formTemplateKey}
                      />
                    )}
                  </div>
                </div>

                {/* Daily log content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="size-4" />
                    Daily Log
                  </div>
                  <div className="rounded-lg border bg-white p-4">
                    {log.description ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: log.description }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No content</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <Separator />

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Created {formatDateTime(log.timestamps?.createdAt)}
                {log.timestamps?.updatedAt && log.timestamps.updatedAt !== log.timestamps.createdAt && (
                  <> &middot; Updated {formatDateTime(log.timestamps.updatedAt)}</>
                )}
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
