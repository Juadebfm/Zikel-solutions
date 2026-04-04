"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FolderOpen,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { useDocumentList, useDocumentCategories, useDeleteDocument } from "@/hooks/api/use-documents"
import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import type { DocumentItem } from "@/services/documents.service"

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
}

// ─── Page ───────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canManageSettings")
  const [activeTab, setActiveTab] = useState("library")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          Documents
        </h1>
        <p className="text-gray-500 mt-1">
          Organise and access the policies, guidance, and records that support
          consistent, high-quality care across every home.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          <LibraryTab guard={guard} />
        </TabsContent>

        <TabsContent value="uploads" className="mt-6">
          <UploadsTab />
        </TabsContent>
      </Tabs>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}

// ─── Library Tab ────────────────────────────────────────────────

function LibraryTab({ guard }: { guard: (action: () => void) => void }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [homeFilter, setHomeFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const pageSizeNum = parseInt(pageSize)

  const { data, isLoading } = useDocumentList({
    page,
    pageSize: pageSizeNum,
    search: searchQuery || undefined,
    category: categoryFilter || undefined,
    homeId: homeFilter || undefined,
  })

  const categoriesQuery = useDocumentCategories()
  const homesQuery = useHomesDropdown()
  const deleteMutation = useDeleteDocument()

  const documents: DocumentItem[] = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? documents.length

  const categories = categoriesQuery.data ?? []
  const homes = homesQuery.data ?? []

  // ── Delete handler ──

  const handleDelete = (doc: DocumentItem) => {
    setProcessingIds((prev) => new Set([...prev, doc.id]))
    deleteMutation.mutate(doc.id, {
      onSuccess: () => {
        showToast(`"${doc.title}" has been removed.`)
        setProcessingIds((prev) => {
          const next = new Set(prev)
          next.delete(doc.id)
          return next
        })
      },
      onError: (err) => {
        showError(
          isApiClientError(err)
            ? getApiErrorMessage(err)
            : "Failed to delete document. Please try again."
        )
        setProcessingIds((prev) => {
          const next = new Set(prev)
          next.delete(doc.id)
          return next
        })
      },
    })
    setDeleteTarget(null)
  }

  // ── Download handler ──

  const handleDownload = (doc: DocumentItem) => {
    // Open the file download in a new tab via the API
    window.open(`/api/documents/${doc.id}/download`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Toolbar: search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search documents..."
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
          <SelectTrigger className="w-[180px]">
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
          value={homeFilter}
          onValueChange={(v) => {
            setHomeFilter(v === "all" ? "" : v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All homes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All homes</SelectItem>
            {homes.map((home) => (
              <SelectItem key={home.value} value={home.value}>
                {home.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {totalItems > 0 && !isLoading && (
          <Badge variant="outline" className="ml-auto text-sm px-3 py-1">
            {totalItems} document{totalItems !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 min-w-[200px]">Title</TableHead>
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Home</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Uploaded By</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {searchQuery || categoryFilter || homeFilter
                      ? "No documents match your search or filters."
                      : "No documents have been added yet. Upload policies, guidance, and records to build your library."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc, index) => {
                const isProcessing = processingIds.has(doc.id)

                if (isProcessing) {
                  return (
                    <TableRow key={doc.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                }

                return (
                  <TableRow key={doc.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {doc.title}
                        </p>
                        {doc.description && (
                          <p className="text-xs text-gray-400 line-clamp-1">{doc.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600">
                        {doc.category || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{doc.homeName || "All homes"}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-gray-600">
                        {doc.uploadedBy?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(doc.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download"
                          className="text-gray-600 hover:text-primary"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => guard(() => setDeleteTarget(doc))}
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
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(1) }}>
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
          <span className="text-xs sm:text-sm text-gray-500">Showing {pageSizeNum} per page</span>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Uploads Tab ────────────────────────────────────────────────

function UploadsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            How Documents Are Uploaded
          </CardTitle>
          <CardDescription>
            Documents are added to the library through everyday care activities
            — no separate upload step needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">Task Submissions</p>
              <p className="text-sm text-gray-500">
                When team members complete tasks that include file attachments — such as
                incident reports, risk assessments, or care plans — those files are
                automatically stored in the document library.
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">Form Completions</p>
              <p className="text-sm text-gray-500">
                Completed forms and their supporting attachments are captured as
                part of the child&apos;s record. Policies and procedures can be
                attached to relevant homes for easy access.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Tip:</span> To add a standalone
              document — for example, an updated policy or external report — use the
              &ldquo;Add Document&rdquo; option within a task or speak to your manager
              about the best way to ensure it reaches the right team members.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
