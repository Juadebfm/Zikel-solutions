"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  PenLine,
  ShieldCheck,
  Upload,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import {
  useAllSummaryTasksToApprove,
  useProcessSummaryBatch,
  useRecordSummaryTaskReviewEvent,
  useSummaryStats,
  useSummaryTaskToApproveDetail,
} from "@/hooks/api/use-summary"
import { getApiErrorMessage, isApiClientError } from "@/lib/api/error"
import { useErrorModalStore } from "@/components/shared/error-modal"
import type { SummaryTaskItem } from "@/services/summary.service"
import { uploadsService } from "@/services/uploads.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PageLoading } from "@/components/shared/page-loading"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PendingRow extends SummaryTaskItem {
  reviewedByCurrentUser: boolean
  reviewedAt: string | null
  taskRoute: string | null
  documentTarget: DocumentTarget | null
}

type SummaryReference = SummaryTaskItem["references"][number]

type DocumentTarget =
  | { kind: "url"; url: string }
  | { kind: "upload"; fileId: string }

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

function normalizeInternalRoute(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return null
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

function pickReference(
  references: SummaryReference[],
  predicate: (reference: SummaryReference) => boolean
): SummaryReference | null {
  const match = references.find(predicate)
  return match ?? null
}

function resolveTaskRoute(row: SummaryTaskItem): string | null {
  const fromLinks = normalizeInternalRoute(row.links.taskUrl)
  if (fromLinks) {
    return fromLinks
  }

  const internalRouteReference = pickReference(
    row.references,
    (reference) =>
      reference.type === "internal_route" && typeof reference.url === "string"
  )

  return normalizeInternalRoute(internalRouteReference?.url ?? null)
}

function resolveDocumentTarget(row: SummaryTaskItem): DocumentTarget | null {
  const directDocumentUrl = row.links.documentUrl?.trim()
  if (directDocumentUrl) {
    return { kind: "url", url: directDocumentUrl }
  }

  const documentUrlReference = pickReference(
    row.references,
    (reference) =>
      reference.type === "document_url" && typeof reference.url === "string" && Boolean(reference.url.trim())
  )
  if (documentUrlReference?.url) {
    return { kind: "url", url: documentUrlReference.url.trim() }
  }

  const uploadReference = pickReference(
    row.references,
    (reference) =>
      reference.type === "upload" &&
      (Boolean(reference.fileId) ||
        (typeof reference.url === "string" && Boolean(reference.url.trim())))
  )
  if (uploadReference?.fileId) {
    return { kind: "upload", fileId: uploadReference.fileId }
  }
  if (uploadReference?.url) {
    return { kind: "url", url: uploadReference.url.trim() }
  }

  return null
}

function toPendingRow(row: SummaryTaskItem, override?: ReviewOverride): PendingRow {
  return {
    ...row,
    reviewedByCurrentUser: override?.reviewedByCurrentUser ?? Boolean(row.review?.reviewedByCurrentUser),
    reviewedAt: override?.reviewedAt ?? row.review?.reviewedAt ?? null,
    taskRoute: resolveTaskRoute(row),
    documentTarget: resolveDocumentTarget(row),
  }
}

const CATEGORY_BADGE_STYLES: Record<SummaryTaskItem["category"], string> = {
  task_log: "border-sky-200 bg-sky-50 text-sky-700",
  document: "border-blue-200 bg-blue-50 text-blue-700",
  system_link: "border-violet-200 bg-violet-50 text-violet-700",
  checklist: "border-teal-200 bg-teal-50 text-teal-700",
  incident: "border-rose-200 bg-rose-50 text-rose-700",
  other: "border-gray-200 bg-gray-50 text-gray-700",
}

const CATEGORY_LABELS: Record<SummaryTaskItem["category"], string> = {
  task_log: "Task Log",
  document: "Document",
  system_link: "System Link",
  checklist: "Checklist",
  incident: "Observation",
  other: "Other",
}

function getCategoryLabel(row: PendingRow): string {
  const label = row.categoryLabel?.trim()
  if (label) {
    return label
  }

  return CATEGORY_LABELS[row.category] ?? "Other"
}

export default function AcknowledgementsPage() {
  const router = useRouter()
  const { user, session, refreshAcknowledgementsGate } = useAuth()

  const statsQuery = useSummaryStats()
  const pendingQuery = useAllSummaryTasksToApprove()
  const reviewEventMutation = useRecordSummaryTaskReviewEvent()
  const processBatchMutation = useProcessSummaryBatch()

  const [reviewOverrides, setReviewOverrides] = useState<Record<string, ReviewOverride>>({})
  const [rowFailureReasons, setRowFailureReasons] = useState<Record<string, string>>({})
  const [highlightedUnreviewed, setHighlightedUnreviewed] = useState<Set<string>>(new Set())
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState | null>(null)
  const [manualSelectedIds, setManualSelectedIds] = useState<Set<string>>(new Set())
  const pendingErrorPromptRef = useRef<string | null>(null)
  const guidePromptShownRef = useRef(false)
  const emptyQueueRedirectRef = useRef(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [isReleasingGate, setIsReleasingGate] = useState(false)
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw")
  const [drawSignatureHasContent, setDrawSignatureHasContent] = useState(false)
  const [uploadedSignatureBlob, setUploadedSignatureBlob] = useState<Blob | null>(null)
  const [uploadedSignatureName, setUploadedSignatureName] = useState<string | null>(null)
  const [signatureDirty, setSignatureDirty] = useState(false)
  const [signatureFileId, setSignatureFileId] = useState<string | null>(null)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const detailQuery = useSummaryTaskToApproveDetail(detailTaskId ?? "", detailModalOpen && Boolean(detailTaskId))

  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    if (detailQuery.error) {
      showError(getApiErrorMessage(detailQuery.error, "Unable to load detail payload."))
    }
  }, [detailQuery.error, showError])

  const rows = useMemo<PendingRow[]>(() => {
    const sourceRows = pendingQuery.data ?? []

    return sourceRows.map((row) => {
      const override = reviewOverrides[row.id]
      return toPendingRow(row, override)
    })
  }, [pendingQuery.data, reviewOverrides])

  const rowIds = useMemo(() => new Set(rows.map((row) => row.id)), [rows])

  const selectedIds = useMemo(() => {
    if (rows.length === 0) {
      return new Set<string>()
    }

    return new Set([...manualSelectedIds].filter((id) => rowIds.has(id)))
  }, [manualSelectedIds, rowIds, rows])

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
  const reviewedCount = rows.filter((row) => row.reviewedByCurrentUser).length
  const remainingReviewCount = rows.length - reviewedCount
  const signatureIsPresent =
    signatureMode === "draw" ? drawSignatureHasContent : Boolean(uploadedSignatureBlob)
  const pendingLoadErrorMessage = pendingQuery.isError
    ? getApiErrorMessage(pendingQuery.error, "Unable to load pending acknowledgements.")
    : null
  const canSubmit =
    allReviewed &&
    selectedIds.size > 0 &&
    signatureIsPresent &&
    !isUploadingSignature &&
    !processBatchMutation.isPending &&
    !pendingQuery.isLoading &&
    !pendingLoadErrorMessage

  const statementName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User"
  const statementDate = new Intl.DateTimeFormat("en-GB").format(new Date())
  const activeOrganizationName =
    session?.memberships.find((membership) => membership.tenantId === session.activeTenantId)
      ?.tenantName ??
    session?.activeTenantId ??
    "your organization"

  // Auto-select items that arrive already reviewed (e.g. from cache or return visit)
  const initialAutoSelectRef = useRef(false)
  useEffect(() => {
    if (initialAutoSelectRef.current || rows.length === 0) return
    const alreadyReviewed = rows.filter((row) => row.reviewedByCurrentUser)
    if (alreadyReviewed.length === 0) return

    initialAutoSelectRef.current = true
    setManualSelectedIds((prev) => {
      const next = new Set(prev)
      for (const row of alreadyReviewed) next.add(row.id)
      return next
    })
  }, [rows])

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

  useEffect(() => {
    if (guidePromptShownRef.current) {
      return
    }

    if (pendingQuery.isLoading || pendingLoadErrorMessage) {
      return
    }

    if (rows.length === 0) {
      return
    }

    // Skip the guide modal if the user has already reviewed at least one item
    const hasAnyReviewed = rows.some((row) => row.reviewedByCurrentUser)
    if (hasAnyReviewed) {
      guidePromptShownRef.current = true
      return
    }

    guidePromptShownRef.current = true
    setShowGuideModal(true)
  }, [pendingLoadErrorMessage, pendingQuery.isLoading, rows])

  useEffect(() => {
    if (pendingQuery.isLoading || pendingLoadErrorMessage) {
      setIsReleasingGate(false)
      return
    }

    if (rows.length > 0) {
      emptyQueueRedirectRef.current = false
      setIsReleasingGate(false)
      return
    }

    if (emptyQueueRedirectRef.current) {
      return
    }

    emptyQueueRedirectRef.current = true
    setIsReleasingGate(true)
    let isCancelled = false

    void (async () => {
      const stillPending = await refreshAcknowledgementsGate()
      if (!stillPending && !isCancelled) {
        router.replace("/my-summary")
      } else if (stillPending && !isCancelled) {
        setIsReleasingGate(false)
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [
    pendingLoadErrorMessage,
    pendingQuery.isLoading,
    refreshAcknowledgementsGate,
    router,
    rows.length,
  ])

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const bounds = canvas.getBoundingClientRect()
    const scaleX = canvas.width / bounds.width
    const scaleY = canvas.height / bounds.height

    return {
      x: (event.clientX - bounds.left) * scaleX,
      y: (event.clientY - bounds.top) * scaleY,
    }
  }

  const beginSignatureStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const point = getCanvasPoint(event)
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = "#1f2937"
    context.lineWidth = 2.5
    context.beginPath()
    context.moveTo(point.x, point.y)

    if (!drawSignatureHasContent) {
      setDrawSignatureHasContent(true)
    }
    if (signatureFileId) {
      setSignatureFileId(null)
    }
    setSignatureDirty(true)

    isDrawingRef.current = true
    canvas.setPointerCapture(event.pointerId)
  }

  const continueSignatureStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {
      return
    }

    const canvas = signatureCanvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const point = getCanvasPoint(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const endSignatureStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }
    isDrawingRef.current = false
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const context = canvas.getContext("2d")
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    setDrawSignatureHasContent(false)
    setUploadedSignatureBlob(null)
    setUploadedSignatureName(null)
    setSignatureDirty(false)
    setSignatureFileId(null)
  }

  const handleSignatureModeChange = (value: string) => {
    if (value === "draw" || value === "upload") {
      setSignatureMode(value)
    }
  }

  const handleSignatureUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const supportedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"])
    if (!supportedMimeTypes.has(file.type)) {
      setFeedbackModal({
        title: "Unsupported Signature File",
        message: "Upload a PNG, JPG, or WebP image for your signature.",
        tone: "error",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackModal({
        title: "Signature File Too Large",
        message: "The maximum signature upload size is 5MB.",
        tone: "error",
      })
      return
    }

    setUploadedSignatureBlob(file)
    setUploadedSignatureName(file.name)
    setSignatureDirty(true)
    setSignatureFileId(null)
    event.target.value = ""
  }

  const canvasToBlob = async (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error("Unable to capture signature image."))
      }, "image/png")
    })

  const ensureSignatureUploaded = async (): Promise<string> => {
    if (signatureFileId && !signatureDirty) {
      return signatureFileId
    }

    setIsUploadingSignature(true)
    try {
      let blob: Blob | null = null
      let fileName = "ack-signature.png"
      let contentType = "image/png"

      if (signatureMode === "upload") {
        if (!uploadedSignatureBlob) {
          throw new Error("Please upload a signature image before submitting.")
        }

        blob = uploadedSignatureBlob
        fileName = uploadedSignatureName ?? "ack-signature-upload.png"
        contentType = uploadedSignatureBlob.type || "image/png"
      } else {
        const canvas = signatureCanvasRef.current
        if (!canvas || !drawSignatureHasContent) {
          throw new Error("Please provide a signature before submitting.")
        }

        blob = await canvasToBlob(canvas)
      }

      if (!blob) {
        throw new Error("Please provide a signature before submitting.")
      }

      const session = await uploadsService.createSession({
        fileName,
        contentType,
        sizeBytes: blob.size,
        purpose: "signature",
      })

      await uploadsService.uploadToSignedUrl({
        url: session.upload.url,
        method: session.upload.method,
        contentType: session.upload.contentType,
        headers: session.upload.headers,
        blob,
      })

      const completed = await uploadsService.completeUpload(session.fileId, blob.size)
      setSignatureFileId(completed.file.id)
      setSignatureDirty(false)
      return completed.file.id
    } finally {
      setIsUploadingSignature(false)
    }
  }

  const handleToggleAll = (checked: boolean | "indeterminate") => {
    if (!checked) {
      setManualSelectedIds(new Set())
      return
    }

    setManualSelectedIds(new Set(rows.map((row) => row.id)))
  }

  const handleToggleRow = (taskId: string, checked: boolean | "indeterminate") => {
    setManualSelectedIds((previous) => {
      const next = new Set(previous)
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

    // Auto-select the item once reviewed so it's ready for submission
    setManualSelectedIds((previous) => {
      if (previous.has(taskId)) return previous
      const next = new Set(previous)
      next.add(taskId)
      return next
    })

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
  ): Promise<boolean> => {
    setFeedbackModal(null)

    try {
      const result = await reviewEventMutation.mutateAsync({
        taskId: row.id,
        payload: { action },
      })

      applyReviewSuccess(row.id, result.reviewedAt ?? new Date().toISOString())
      return true
    } catch (error) {
      setFeedbackModal({
        title: "Action Failed",
        message: getApiErrorMessage(error, "Unable to register review action."),
        tone: "error",
      })
      return false
    }
  }

  const openDocumentTarget = async (target: DocumentTarget) => {
    if (typeof window === "undefined") {
      return
    }

    if (target.kind === "url") {
      window.open(target.url, "_blank", "noopener,noreferrer")
      return
    }

    const result = await uploadsService.getDownloadUrl(target.fileId)
    window.open(result.url, "_blank", "noopener,noreferrer")
  }

  const openFallbackDetail = (row: PendingRow) => {
    setDetailTaskId(row.id)
    setDetailModalOpen(true)
  }

  const handleOpenDetail = async (row: PendingRow) => {
    if (row.taskRoute) {
      const tracked = await submitReviewEvent(row, "open_task")
      if (!tracked) {
        return
      }
      router.push(row.taskRoute)
      return
    }

    if (row.documentTarget) {
      const tracked = await submitReviewEvent(row, "open_document")
      if (!tracked) {
        return
      }

      try {
        await openDocumentTarget(row.documentTarget)
      } catch (error) {
        setFeedbackModal({
          title: "Document Unavailable",
          message: getApiErrorMessage(error, "Unable to open this document right now."),
          tone: "error",
        })
      }
      return
    }

    const tracked = await submitReviewEvent(row, "view_detail")
    if (!tracked) {
      return
    }
    openFallbackDetail(row)
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
      const uploadedSignatureFileId = await ensureSignatureUploaded()

      const result = await processBatchMutation.mutateAsync({
        taskIds: selectedTaskIds,
        action: "approve",
        signatureFileId: uploadedSignatureFileId,
      })

      if (result.failed.length > 0) {
        const failures = Object.fromEntries(
          result.failed.map((failure) => [failure.taskId, failure.reason])
        )
        setRowFailureReasons(failures)
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
        const refreshedRows = (refreshed.data ?? []).map((row) => toPendingRow(row))

        markUnreviewedRows(refreshedRows)
        setFeedbackModal({
          title: "Review Required",
          message: "Please review the item(s) before acknowledging.",
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

      if (
        isApiClientError(error) &&
        (error.status === 400 || error.status === 422 || error.code === "FST_ERR_VALIDATION")
      ) {
        setFeedbackModal({
          title: "Validation Error",
          message: getApiErrorMessage(error, "Please fix the highlighted input and try again."),
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

  const pendingCount = pendingQuery.isLoading ? (statsQuery.data?.pendingApproval ?? 0) : rows.length

  if (isReleasingGate) {
    return <PageLoading message="No pending acknowledgements. Redirecting..." fullscreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Acknowledgements Required</h1>
          <p className="text-gray-600 mt-2">
            Complete all required reviews before accessing the rest of the dashboard.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowGuideModal(true)}>
          How This Works
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Pending items for {activeOrganizationName}:{" "}
            <span className="font-semibold">{pendingCount}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span>
            Reviewed: <span className="font-semibold">{reviewedCount}</span> / {rows.length}
          </span>
          <span className="text-gray-400">•</span>
          <span>
            Signature:{" "}
            <span className={signatureIsPresent ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
              {signatureIsPresent ? "Ready" : "Required"}
            </span>
          </span>
        </div>
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
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading pending acknowledgements...
                  </span>
                </TableCell>
              </TableRow>
            ) : pendingLoadErrorMessage ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-red-600">
                  Unable to load pending acknowledgements. Please retry.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-500">
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
                    <TableCell>
                      <p className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2">
                        {row.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Task ID: {row.taskRef || row.id}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={CATEGORY_BADGE_STYLES[row.category] ?? CATEGORY_BADGE_STYLES.other}
                      >
                        {getCategoryLabel(row)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isReviewed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }
                      >
                        {isReviewed ? "Reviewed" : "Pending Review"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isReviewed && row.reviewedAt ? formatDateTime(row.reviewedAt) : "-"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleOpenDetail(row)}
                        disabled={reviewEventMutation.isPending}
                      >
                        View detail
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Signature</p>
          <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
            Clear
          </Button>
        </div>
        <Tabs value={signatureMode} onValueChange={handleSignatureModeChange} className="gap-4">
          <TabsList>
            <TabsTrigger value="draw">
              <PenLine className="h-3.5 w-3.5" />
              Draw Signature
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-3.5 w-3.5" />
              Upload Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="draw">
            <canvas
              ref={signatureCanvasRef}
              width={1600}
              height={320}
              className="h-40 w-full rounded border border-dashed border-gray-300 bg-gray-50 touch-none"
              onPointerDown={beginSignatureStroke}
              onPointerMove={continueSignatureStroke}
              onPointerUp={endSignatureStroke}
              onPointerLeave={endSignatureStroke}
            />
          </TabsContent>
          <TabsContent value="upload">
            <div className="space-y-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-4">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleSignatureUploadChange}
              />
              <p className="text-xs text-gray-600">
                Upload a PNG, JPG, or WebP signature image (max 5MB).
              </p>
              {uploadedSignatureName ? (
                <p className="text-xs text-emerald-700">
                  Selected file: <span className="font-medium">{uploadedSignatureName}</span>
                </p>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-gray-600">
            {signatureMode === "draw"
              ? "Draw your signature above with mouse, touch, or stylus."
              : "Upload your signature image before submitting."}
          </span>
          <span className={signatureFileId ? "text-emerald-700" : "text-gray-500"}>
            {signatureFileId ? `Uploaded signature ID: ${signatureFileId}` : "Signature not uploaded yet"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        {!canSubmit ? (
          <p className="text-xs text-gray-600">
            {!allReviewed
              ? `${remainingReviewCount} item(s) still need review.`
              : selectedIds.size === 0
                ? "Select at least one item to submit."
                : !signatureIsPresent
                  ? "Add a signature before submitting."
                  : "Complete all required steps to continue."}
          </p>
        ) : null}
        <Button
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          size="lg"
        >
          {processBatchMutation.isPending || isUploadingSignature ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {isUploadingSignature ? "Uploading signature..." : "Submit Acknowledgements"}
            </span>
          )}
        </Button>
      </div>

      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-lg" showCloseButton={false}>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ClipboardCheck className="h-5 w-5 text-emerald-300" />
                Before You Submit
              </DialogTitle>
              <DialogDescription className="text-slate-200">
                Follow these steps so your acknowledgement can be accepted.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-3 px-6 py-5">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">1. Review every pending item.</p>
              <p className="mt-1 text-gray-600">Use View detail, Document, or Task to mark each row as reviewed.</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">2. Add your signature.</p>
              <p className="mt-1 text-gray-600">You can draw directly or upload a signature image file.</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">3. Submit acknowledgements.</p>
              <p className="mt-1 text-gray-600">The submit button activates only when all requirements are complete.</p>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button type="button" size="lg" onClick={() => setShowGuideModal(false)}>
              Start Reviewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open)
          if (!open) {
            setDetailTaskId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Detail</DialogTitle>
            <DialogDescription>
              Full detail rendered from the approvals detail endpoint.
            </DialogDescription>
          </DialogHeader>

          {!detailTaskId || detailQuery.isLoading ? (
            <div className="py-10 text-center text-gray-500">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading detail...
              </span>
            </div>
          ) : detailQuery.isError ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Unable to load detail payload.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-md border bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-medium text-gray-700">Task Ref:</span>{" "}
                  {detailQuery.data?.taskRef || "-"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Title:</span>{" "}
                  {detailQuery.data?.title || "-"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Category:</span>{" "}
                  {detailQuery.data?.categoryLabel || detailQuery.data?.category || "-"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  {detailQuery.data?.status || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800">Render Payload</p>
                <pre className="max-h-[320px] overflow-auto rounded-md border bg-gray-900 p-4 text-xs text-gray-100">
                  {JSON.stringify(detailQuery.data?.renderPayload ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDetailModalOpen(false)
                setDetailTaskId(null)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(feedbackModal)} onOpenChange={(open) => {
        if (!open) {
          setFeedbackModal(null)
        }
      }}>
        <DialogContent className="overflow-hidden border-0 p-0 sm:max-w-md" showCloseButton={false}>
          <div className={feedbackModal?.tone === "error" ? "bg-red-50 px-6 py-4" : "bg-emerald-50 px-6 py-4"}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {feedbackModal?.tone === "error" ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                {feedbackModal?.title}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 py-5">
            <DialogDescription className={feedbackModal?.tone === "error" ? "text-red-700" : "text-emerald-700"}>
              {feedbackModal?.message}
            </DialogDescription>
          </div>
          <DialogFooter className="px-6 pb-6">
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
          </DialogFooter>
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
