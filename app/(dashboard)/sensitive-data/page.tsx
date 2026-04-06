"use client"

import { useCallback, useState } from "react"
import { format } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  Search,
  Shield,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
import { useHomesDropdown, useYoungPeopleDropdown } from "@/hooks/api/use-dropdown-data"
import {
  useSensitiveDataList,
  useSensitiveDataDetail,
  useSensitiveDataCategories,
  useCreateSensitiveRecord,
  useDeleteSensitiveRecord,
  useSensitiveDataAccessLog,
} from "@/hooks/api/use-sensitive-data"
import type { ConfidentialityScope, SensitiveRecord } from "@/services/sensitive-data.service"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy, HH:mm")
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
}

const confidentialityConfig: Record<
  ConfidentialityScope,
  { bg: string; text: string; label: string }
> = {
  restricted: { bg: "bg-amber-100", text: "text-amber-700", label: "Restricted" },
  confidential: { bg: "bg-orange-100", text: "text-orange-700", label: "Confidential" },
  highly_confidential: { bg: "bg-red-100", text: "text-red-700", label: "Highly Confidential" },
}

// ─── Page ───────────────────────────────────────────────────────

export default function SensitiveDataPage() {
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canManageSettings")

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [scopeFilter, setScopeFilter] = useState("")
  const [homeFilter, setHomeFilter] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const pageSizeNum = parseInt(pageSize)

  const { data, isLoading } = useSensitiveDataList({
    page,
    pageSize: pageSizeNum,
    search: searchQuery || undefined,
    category: categoryFilter || undefined,
    confidentialityScope: (scopeFilter as ConfidentialityScope) || undefined,
    homeId: homeFilter || undefined,
  })

  const records: SensitiveRecord[] = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? records.length

  const categoriesQuery = useSensitiveDataCategories()
  const categories = categoriesQuery.data ?? []

  const homesQuery = useHomesDropdown()
  const homes = homesQuery.data ?? []

  const deleteMutation = useDeleteSensitiveRecord()

  const handleDelete = useCallback(
    (id: string) => {
      setProcessingIds((prev) => new Set([...prev, id]))
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast("Record deleted successfully.")
          setDeleteTarget(null)
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete record.")
          setDeleteTarget(null)
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
      })
    },
    [deleteMutation, showToast, showError]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Sensitive Data
        </h1>
        <p className="text-gray-500 mt-1">
          Confidential records are handled with the highest care. Access is logged
          for transparency and accountability.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search records..."
              className="pl-9 h-10"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v === "all" ? "" : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={scopeFilter}
            onValueChange={(v) => {
              setScopeFilter(v === "all" ? "" : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All scopes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All scopes</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
              <SelectItem value="highly_confidential">Highly Confidential</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={homeFilter}
            onValueChange={(v) => {
              setHomeFilter(v === "all" ? "" : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All homes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All homes</SelectItem>
              {homes.map((h) => (
                <SelectItem key={h.value} value={h.value}>
                  {h.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="gap-2"
          onClick={() => guard(() => setCreateOpen(true))}
        >
          <Plus className="h-4 w-4" />
          Create Record
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 min-w-[180px]">Title</TableHead>
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Confidentiality</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Related To</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Created By</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">No sensitive data records found.</p>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record, index) => {
                const conf =
                  confidentialityConfig[record.confidentialityScope] ??
                  confidentialityConfig.restricted
                const isProcessing = processingIds.has(record.id)

                return isProcessing ? (
                  <TableRow key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ) : (
                  <TableRow key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => guard(() => setDetailRecordId(record.id))}
                        className="text-sm text-primary hover:underline font-medium line-clamp-1 text-left"
                      >
                        {record.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600">
                        {record.category || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", conf.bg, conf.text)}>
                        {conf.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-0.5">
                        {record.youngPersonName && (
                          <p className="text-sm text-gray-700 truncate max-w-[140px]">
                            {record.youngPersonName}
                          </p>
                        )}
                        {record.homeName && (
                          <p className="text-xs text-gray-400 truncate max-w-[140px]">
                            {record.homeName}
                          </p>
                        )}
                        {!record.youngPersonName && !record.homeName && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {record.createdBy?.name ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {formatShortDate(record.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View detail"
                          onClick={() => guard(() => setDetailRecordId(record.id))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            guard(() =>
                              setDeleteTarget({ id: record.id, title: record.title })
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 pb-4">
        <div className="flex items-center gap-3">
          <Select
            value={pageSize}
            onValueChange={(v) => {
              setPageSize(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-16 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs sm:text-sm text-gray-500">
            {totalItems} record{totalItems !== 1 ? "s" : ""} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="px-2 py-1 border rounded text-center min-w-8">{page}</span>
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Record Dialog */}
      <CreateRecordDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        homes={homes}
      />

      {/* Detail Drawer */}
      <RecordDetailDrawer
        recordId={detailRecordId}
        open={detailRecordId !== null}
        onClose={() => setDetailRecordId(null)}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{deleteTarget?.title}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}

// ─── Create Record Dialog ──────────────────────────────────────

function CreateRecordDialog({
  open,
  onClose,
  categories,
  homes,
}: {
  open: boolean
  onClose: () => void
  categories: string[]
  homes: { value: string; label: string }[]
}) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [scope, setScope] = useState<ConfidentialityScope>("restricted")
  const [homeId, setHomeId] = useState("")
  const [youngPersonId, setYoungPersonId] = useState("")
  const [retentionDate, setRetentionDate] = useState("")

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const youngPeopleQuery = useYoungPeopleDropdown(homeId || undefined)
  const youngPeople = youngPeopleQuery.data ?? []

  const createMutation = useCreateSensitiveRecord()

  const resetForm = useCallback(() => {
    setTitle("")
    setCategory("")
    setContent("")
    setScope("restricted")
    setHomeId("")
    setYoungPersonId("")
    setRetentionDate("")
  }, [])

  const handleCreate = useCallback(() => {
    if (!title.trim() || !category || !content.trim()) {
      showError("Please fill in all required fields (title, category, content).")
      return
    }
    createMutation.mutate(
      {
        title: title.trim(),
        category,
        content: content.trim(),
        confidentialityScope: scope,
        homeId: homeId || undefined,
        youngPersonId: youngPersonId || undefined,
        retentionDate: retentionDate || undefined,
      },
      {
        onSuccess: () => {
          showToast("Record created successfully.")
          resetForm()
          onClose()
        },
        onError: (err) => {
          showError(
            isApiClientError(err) ? getApiErrorMessage(err) : "Failed to create record."
          )
        },
      }
    )
  }, [
    title,
    category,
    content,
    scope,
    homeId,
    youngPersonId,
    retentionDate,
    createMutation,
    showError,
    showToast,
    resetForm,
    onClose,
  ])

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-2xl border-0 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sensitive Record</DialogTitle>
          <DialogDescription>
            Add a new confidential record. All access will be logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Record title"
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record content..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Confidentiality Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as ConfidentialityScope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="highly_confidential">Highly Confidential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Home</Label>
              <Select
                value={homeId}
                onValueChange={(v) => {
                  setHomeId(v)
                  setYoungPersonId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select home..." />
                </SelectTrigger>
                <SelectContent>
                  {homes.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Young Person</Label>
              <Select
                value={youngPersonId}
                onValueChange={setYoungPersonId}
                disabled={!homeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select young person..." />
                </SelectTrigger>
                <SelectContent>
                  {youngPeople.map((yp) => (
                    <SelectItem key={yp.value} value={yp.value}>
                      {yp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Retention Date</Label>
            <Input
              type="date"
              value={retentionDate}
              onChange={(e) => setRetentionDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              resetForm()
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            className="rounded-lg"
            disabled={createMutation.isPending}
            onClick={handleCreate}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Detail Drawer ─────────────────────────────────────────────

function RecordDetailDrawer({
  recordId,
  open,
  onClose,
}: {
  recordId: string | null
  open: boolean
  onClose: () => void
}) {
  const detailQuery = useSensitiveDataDetail(recordId ?? "", open && Boolean(recordId))
  const accessLogQuery = useSensitiveDataAccessLog(recordId ?? "", open && Boolean(recordId))

  const record = detailQuery.data
  const accessLog = accessLogQuery.data ?? []

  const conf = record
    ? confidentialityConfig[record.confidentialityScope] ?? confidentialityConfig.restricted
    : null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetTitle className="sr-only">
          {record ? record.title : "Sensitive Record"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Sensitive data record detail view
        </SheetDescription>

        {detailQuery.isLoading && (
          <div className="flex flex-col flex-1 p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Separator />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
            <Separator />
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`log-${i}`} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {record && !detailQuery.isLoading && (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">{record.title}</h2>
                <div className="flex gap-2 flex-wrap">
                  {conf && (
                    <Badge className={cn("text-xs", conf.bg, conf.text)}>
                      {conf.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {record.category}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Content
                </p>
                <div className="rounded-md border p-4 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50">
                  {record.content}
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {record.youngPersonName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Young Person</p>
                    <p className="font-medium">{record.youngPersonName}</p>
                  </div>
                )}
                {record.homeName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Home</p>
                    <p className="font-medium">{record.homeName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="font-medium">{record.createdBy?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(record.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(record.updatedAt)}</p>
                </div>
                {record.retentionDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Retention Date</p>
                    <p className="font-medium">{formatShortDate(record.retentionDate)}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Access Log */}
              <div className="space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Access Log
                </p>

                {accessLogQuery.isLoading && (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                )}

                {!accessLogQuery.isLoading && accessLog.length === 0 && (
                  <p className="text-sm text-muted-foreground">No access log entries yet.</p>
                )}

                {!accessLogQuery.isLoading && accessLog.length > 0 && (
                  <div className="space-y-2">
                    {accessLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md border p-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1"
                      >
                        <span className="font-medium">{entry.userName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {entry.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.accessedAt)}
                        </span>
                        {entry.ipAddress && (
                          <span className="text-xs text-muted-foreground">
                            IP: {entry.ipAddress}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
