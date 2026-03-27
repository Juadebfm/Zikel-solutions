"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import {
  useAllSummaryTasksToApprove,
  useProcessSummaryBatch,
  useRecordSummaryTaskReviewEvent,
  useSummaryStats,
} from "@/hooks/api/use-summary"
import { getApiErrorMessage, isApiClientError } from "@/lib/api/error"
import type { SummaryTaskToApprove } from "@/services/summary.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PendingRow extends SummaryTaskToApprove {
  reviewedByCurrentUser: boolean
  reviewedAt: string | null
}

interface ReviewOverride {
  reviewedByCurrentUser: boolean
  reviewedAt: string | null
}

interface FeedbackModalState {
  title: string
  message: string
  tone: "error" | "success"
  retryAction?: "reload_pending"
}

export default function AcknowledgementsPage() {
  const router = useRouter()
  const { user, refreshAcknowledgementsGate } = useAuth()

  const statsQuery = useSummaryStats()
  const pendingQuery = useAllSummaryTasksToApprove()
  const reviewEventMutation = useRecordSummaryTaskReviewEvent()
  const processBatchMutation = useProcessSummaryBatch()

  const [reviewOverrides, setReviewOverrides] = useState<Record<string, ReviewOverride>>({})
  const [rowFailureReasons, setRowFailureReasons] = useState<Record<string, string>>({})
  const [highlightedUnreviewed, setHighlightedUnreviewed] = useState<Set<string>>(new Set())
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState | null>(null)
  const [selectionTouched, setSelectionTouched] = useState(false)
  const [manualSelectedIds, setManualSelectedIds] = useState<Set<string>>(new Set())
  const pendingErrorPromptRef = useRef<string | null>(null)

  const rows = useMemo<PendingRow[]>(() => {
    const sourceRows = pendingQuery.data ?? []

    return sourceRows.map((row) => {
      const override = reviewOverrides[row.id]
      return {
        ...row,
        reviewedByCurrentUser: override?.reviewedByCurrentUser ?? Boolean(row.reviewedByCurrentUser),
        reviewedAt: override?.reviewedAt ?? row.reviewedAt ?? null,
      }
    })
  }, [pendingQuery.data, reviewOverrides])

  const rowIds = useMemo(() => new Set(rows.map((row) => row.id)), [rows])

  const selectedIds = useMemo(() => {
    if (rows.length === 0) {
      return new Set<string>()
    }

    if (!selectionTouched) {
      return new Set(rows.map((row) => row.id))
    }

    return new Set([...manualSelectedIds].filter((id) => rowIds.has(id)))
  }, [manualSelectedIds, rowIds, rows, selectionTouched])

  const visibleFailureReasons = useMemo(() => {
    const next: Record<string, string> = {}
    for (const [taskId, reason] of Object.entries(rowFailureReasons)) {
      if (rowIds.has(taskId)) {
        next[taskId] = reason
      }
    }
    return next
  }, [rowFailureReasons, rowIds])

  const visibleHighlightedUnreviewed = useMemo(
    () => new Set([...highlightedUnreviewed].filter((taskId) => rowIds.has(taskId))),
    [highlightedUnreviewed, rowIds]
  )

  const allReviewed = rows.length > 0 && rows.every((row) => row.reviewedByCurrentUser)
  const pendingLoadErrorMessage = pendingQuery.isError
    ? getApiErrorMessage(pendingQuery.error, "Unable to load pending acknowledgements.")
    : null
  const canSubmit =
    allReviewed &&
    selectedIds.size > 0 &&
    !processBatchMutation.isPending &&
    !pendingQuery.isLoading &&
    !pendingLoadErrorMessage

  const statementName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User"
  const statementDate = new Intl.DateTimeFormat("en-GB").format(new Date())

  useEffect(() => {
    if (!pendingLoadErrorMessage) {
      pendingErrorPromptRef.current = null
      return
    }

    if (pendingErrorPromptRef.current === pendingLoadErrorMessage) {
      return
    }

    pendingErrorPromptRef.current = pendingLoadErrorMessage
    setFeedbackModal({
      title: "Unable to Load Pending Items",
      message: pendingLoadErrorMessage,
      tone: "error",
      retryAction: "reload_pending",
    })
  }, [pendingLoadErrorMessage])

  const handleToggleAll = (checked: boolean | "indeterminate") => {
    setSelectionTouched(true)

    if (!checked) {
      setManualSelectedIds(new Set())
      return
    }

    setManualSelectedIds(new Set(rows.map((row) => row.id)))
  }

  const handleToggleRow = (taskId: string, checked: boolean | "indeterminate") => {
    setSelectionTouched(true)

    setManualSelectedIds((previous) => {
      const next = selectionTouched ? new Set(previous) : new Set(rows.map((row) => row.id))
      if (checked) {
        next.add(taskId)
      } else {
        next.delete(taskId)
      }
      return next
    })
  }

  const applyReviewSuccess = (taskId: string, reviewedAt: string | null) => {
    setReviewOverrides((previous) => ({
      ...previous,
      [taskId]: {
        reviewedByCurrentUser: true,
        reviewedAt,
      },
    }))

    setHighlightedUnreviewed((previous) => {
      if (!previous.has(taskId)) {
        return previous
      }

      const next = new Set(previous)
      next.delete(taskId)
      return next
    })
  }

  const submitReviewEvent = async (
    row: PendingRow,
    action: "view_detail" | "open_document" | "open_task"
  ) => {
    setFeedbackModal(null)

    try {
      const result = await reviewEventMutation.mutateAsync({
        taskId: row.id,
        payload: { action },
      })

      applyReviewSuccess(row.id, result.reviewedAt ?? new Date().toISOString())
    } catch (error) {
      setFeedbackModal({
        title: "Action Failed",
        message: getApiErrorMessage(error, "Unable to register review action."),
        tone: "error",
      })
    }
  }

  const handleOpenDetail = async (row: PendingRow) => {
    await submitReviewEvent(row, "view_detail")
  }

  const handleOpenDocument = async (row: PendingRow) => {
    await submitReviewEvent(row, "open_document")

    if (row.documentUrl && typeof window !== "undefined") {
      window.open(row.documentUrl, "_blank", "noopener,noreferrer")
      return
    }

    setFeedbackModal({
      title: "Review Logged",
      message: "No document link was provided for this row.",
      tone: "success",
    })
  }

  const handleOpenTask = async (row: PendingRow) => {
    await submitReviewEvent(row, "open_task")

    if (row.taskUrl) {
      router.push(row.taskUrl)
      return
    }

    router.push(`/tasks?taskId=${encodeURIComponent(row.id)}`)
  }

  const markUnreviewedRows = (pendingRows: PendingRow[]) => {
    const unreviewedIds = pendingRows
      .filter((row) => !row.reviewedByCurrentUser)
      .map((row) => row.id)
    setHighlightedUnreviewed(new Set(unreviewedIds))
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }

    setFeedbackModal(null)

    const selectedTaskIds = rows
      .filter((row) => selectedIds.has(row.id))
      .map((row) => row.id)

    try {
      const result = await processBatchMutation.mutateAsync({
        taskIds: selectedTaskIds,
        action: "approve",
      })

      if (result.failed.length > 0) {
        const failures = Object.fromEntries(
          result.failed.map((failure) => [failure.taskId, failure.reason])
        )
        setRowFailureReasons(failures)
        setSelectionTouched(true)
        setManualSelectedIds(new Set(result.failed.map((failure) => failure.taskId)))
        setFeedbackModal({
          title: "Some Items Were Not Processed",
          message: `Processed ${result.processed}. ${result.failed.length} item(s) failed and still require action.`,
          tone: "error",
        })
      } else {
        setRowFailureReasons({})
        setFeedbackModal({
          title: "Acknowledgements Submitted",
          message: "Acknowledgements submitted successfully.",
          tone: "success",
        })
      }

      await Promise.all([statsQuery.refetch(), pendingQuery.refetch()])
      const stillPending = await refreshAcknowledgementsGate()

      if (!stillPending) {
        router.replace("/my-summary")
      }
    } catch (error) {
      if (
        isApiClientError(error) &&
        error.code === "REVIEW_REQUIRED_BEFORE_ACKNOWLEDGE"
      ) {
        const refreshed = await pendingQuery.refetch()
        const refreshedRows = (refreshed.data ?? []).map((row) => ({
          ...row,
          reviewedByCurrentUser: Boolean(row.reviewedByCurrentUser),
          reviewedAt: row.reviewedAt ?? null,
        }))

        markUnreviewedRows(refreshedRows)
        setFeedbackModal({
          title: "Review Required",
          message: "Please review highlighted rows before acknowledging.",
          tone: "error",
        })
        return
      }

      if (isApiClientError(error) && error.code === "MFA_REQUIRED") {
        setFeedbackModal({
          title: "MFA Required",
          message: "Complete MFA verification to continue.",
          tone: "error",
        })
        return
      }

      setFeedbackModal({
        title: "Submission Failed",
        message: getApiErrorMessage(error, "Unable to submit acknowledgements."),
        tone: "error",
      })
    }
  }

  const pendingCount = statsQuery.data?.pendingApproval ?? rows.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Acknowledgements Required</h1>
        <p className="text-gray-600 mt-2">
          Complete all required reviews before accessing the rest of the dashboard.
        </p>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Pending items in your active tenant:{" "}
        <span className="font-semibold">{pendingCount}</span>
      </div>

      <p className="text-sm text-gray-700">
        I, <span className="font-semibold">{statementName}</span>, acknowledge that on{" "}
        <span className="font-semibold">{statementDate}</span>, I have reviewed and agree with
        the information. I confirm that I fully understand its content and will comply with all
        applicable procedures and policies.
      </p>

      <div className="rounded-lg border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={rows.length > 0 && selectedIds.size === rows.length}
                  onCheckedChange={handleToggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead>Reviewed</TableHead>
              <TableHead>Reviewed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading pending acknowledgements...
                  </span>
                </TableCell>
              </TableRow>
            ) : pendingLoadErrorMessage ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-red-600">
                  Unable to load pending acknowledgements. Please retry.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                  No pending acknowledgements.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isReviewed = row.reviewedByCurrentUser
                const hasFailure = Boolean(visibleFailureReasons[row.id])
                const highlightUnreviewed = visibleHighlightedUnreviewed.has(row.id)

                return (
                  <TableRow
                    key={row.id}
                    className={highlightUnreviewed ? "bg-amber-50/70" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onCheckedChange={(checked) => handleToggleRow(row.id, checked)}
                        aria-label={`Select ${row.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2">
                      {row.title}
                    </TableCell>
                    <TableCell>{row.category ?? row.relation ?? "-"}</TableCell>
                    <TableCell>{row.createdBy ?? row.assignee ?? "-"}</TableCell>
                    <TableCell>{formatDateTime(row.createdOn ?? row.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={isReviewed ? "default" : "outline"}>
                        {isReviewed ? "Reviewed" : "Pending review"}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.reviewedAt ? formatDateTime(row.reviewedAt) : "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleOpenDetail(row)}
                        disabled={reviewEventMutation.isPending}
                      >
                        View detail
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleOpenDocument(row)}
                        disabled={reviewEventMutation.isPending}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Document
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleOpenTask(row)}
                        disabled={reviewEventMutation.isPending}
                      >
                        Task
                      </Button>
                      {hasFailure ? (
                        <div className="pt-1 text-xs text-red-600">
                          {visibleFailureReasons[row.id]}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Signature</p>
        <div className="h-40 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
          <span className="text-4xl italic text-gray-800">{statementName}</span>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Button
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8"
        >
          {processBatchMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Submit Acknowledgements
            </span>
          )}
        </Button>
      </div>

      <Dialog open={Boolean(feedbackModal)} onOpenChange={(open) => {
        if (!open) {
          setFeedbackModal(null)
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {feedbackModal?.tone === "error" ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
              {feedbackModal?.title}
            </DialogTitle>
            <DialogDescription className={feedbackModal?.tone === "error" ? "text-red-700" : "text-emerald-700"}>
              {feedbackModal?.message}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2">
            {feedbackModal?.retryAction === "reload_pending" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  pendingErrorPromptRef.current = null
                  setFeedbackModal(null)
                  void pendingQuery.refetch()
                }}
                disabled={pendingQuery.isFetching}
              >
                {pendingQuery.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Retry"
                )}
              </Button>
            ) : null}
            <Button type="button" onClick={() => setFeedbackModal(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
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
