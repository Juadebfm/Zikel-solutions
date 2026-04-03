"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronLeft,
  Search,
  ClipboardCheck,
  AlertTriangle,
  Users,
  Layers,
  CheckCircle2,
  XCircle,
  UserRoundPlus,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useTaskList, useTaskAction } from "@/hooks/api/use-tasks"
import { useBatchReassign } from "@/hooks/api/use-summary"
import { useEmployeesDropdown } from "@/hooks/api/use-dropdown-data"
import type { TaskListItem } from "@/services/tasks.service"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import { statusColors } from "@/lib/constants"
import { getInitials } from "@/lib/utils"
import { TaskDetailDrawer } from "@/components/task-explorer/task-detail-drawer"

// ─── Helpers ─────────────────────────────────────────────────────

const priorityConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "Low", className: "bg-green-100 text-green-700 border-green-200" },
} as const

function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1d ago"
  return `${diffDays}d ago`
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Component ───────────────────────────────────────────────────

export default function PendingApprovalPage() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "approve" | "reject" | "reassign"
    taskIds: string[]
  } | null>(null)
  const [reassigneeId, setReassigneeId] = useState("")
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null)
  const [processingTaskIds, setProcessingTaskIds] = useState<Set<string>>(new Set())

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const pageSizeNum = parseInt(pageSize)
  const { data, isLoading } = useTaskList({
    status: "sent_for_approval",
    scope: "approvals",
    page,
    pageSize: pageSizeNum,
    search: searchQuery || undefined,
  })

  const allTasks: TaskListItem[] = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? allTasks.length

  // Mutations
  const taskActionMutation = useTaskAction()
  const batchReassignMutation = useBatchReassign()
  const employeesQuery = useEmployeesDropdown()
  const employees = employeesQuery.data ?? []

  // Summary stats derived from current page data
  const summary = useMemo(() => {
    const priorities = { urgent: 0, high: 0, medium: 0, low: 0 }
    const unassigned = allTasks.filter((t) => !t.assignee).length
    const categories = new Set<string>()

    for (const t of allTasks) {
      priorities[t.priority]++
      if (t.categoryLabel) categories.add(t.categoryLabel)
    }

    return { priorities, unassigned, categoryCount: categories.size }
  }, [allTasks])

  // Selection
  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllRows = () => {
    if (selectedRows.size === allTasks.length) setSelectedRows(new Set())
    else setSelectedRows(new Set(allTasks.map((t) => t.id)))
  }

  // Handlers
  const isPending = taskActionMutation.isPending || batchReassignMutation.isPending

  const handleApprove = (ids: string[]) => {
    let processed = 0
    let failed = 0
    const total = ids.length

    ids.forEach((taskId) => {
      taskActionMutation.mutate(
        { taskId, payload: { action: "approve" } },
        {
          onSuccess: () => {
            processed++
            if (processed + failed === total) {
              if (failed > 0) showError(`Approved ${processed}, ${failed} failed.`)
              else showToast(`Approved ${processed} task(s).`)
              setSelectedRows(new Set())
            }
          },
          onError: () => {
            failed++
            if (processed + failed === total) {
              showError(`Approved ${processed}, ${failed} failed.`)
              setSelectedRows(new Set())
            }
          },
        }
      )
    })
    setConfirmDialog(null)
  }

  const handleReject = (ids: string[]) => {
    let processed = 0
    let failed = 0
    const total = ids.length

    ids.forEach((taskId) => {
      taskActionMutation.mutate(
        { taskId, payload: { action: "reject" } },
        {
          onSuccess: () => {
            processed++
            if (processed + failed === total) {
              if (failed > 0) showError(`Rejected ${processed}, ${failed} failed.`)
              else showToast(`Rejected ${processed} task(s).`)
              setSelectedRows(new Set())
            }
          },
          onError: () => {
            failed++
            if (processed + failed === total) {
              showError(`Rejected ${processed}, ${failed} failed.`)
              setSelectedRows(new Set())
            }
          },
        }
      )
    })
    setConfirmDialog(null)
  }

  const handleReassign = (ids: string[]) => {
    if (!reassigneeId) { showError("Please select an employee."); return }
    batchReassignMutation.mutate({ taskIds: ids, assigneeId: reassigneeId }, {
      onSuccess: (r) => {
        if (r.failed.length > 0) showError(`Reassigned ${r.processed}, ${r.failed.length} failed.`)
        else showToast(`Reassigned ${r.processed} task(s).`)
        setSelectedRows(new Set())
        setReassigneeId("")
      },
      onError: (err) => showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to reassign tasks."),
    })
    setConfirmDialog(null)
  }

  const colors = statusColors.pending

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/my-summary" className="text-primary hover:underline font-medium">My Summary</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Pending Approval</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Pending Approval</h1>
          <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} border text-sm px-3 py-1`}>
            {totalItems} pending
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><ClipboardCheck className="h-4 w-4 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-xs text-gray-500">Total Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100"><AlertTriangle className="h-4 w-4 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.priorities.urgent + summary.priorities.high}</p>
              <p className="text-xs text-gray-500">Urgent / High</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100"><Users className="h-4 w-4 text-gray-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.unassigned}</p>
              <p className="text-xs text-gray-500">Unassigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Layers className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.categoryCount}</p>
              <p className="text-xs text-gray-500">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            placeholder="Search by title, ref, assignee, entity..."
            className="pl-9 h-10"
          />
        </div>

        {/* Bulk actions */}
        {selectedRows.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{selectedRows.size} selected</span>
            <Button variant="outline" size="sm" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50" onClick={() => setConfirmDialog({ type: "approve", taskIds: Array.from(selectedRows) })}>
              <CheckCircle2 className="h-4 w-4" /> Approve All
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmDialog({ type: "reject", taskIds: Array.from(selectedRows) })}>
              <XCircle className="h-4 w-4" /> Reject
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirmDialog({ type: "reassign", taskIds: Array.from(selectedRows) })}>
              <UserRoundPlus className="h-4 w-4" /> Reassign
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 pl-4">
                <Checkbox checked={allTasks.length > 0 && selectedRows.size === allTasks.length} onCheckedChange={toggleAllRows} />
              </TableHead>
              <TableHead className="font-semibold text-gray-700 w-20 sm:w-28">Ref</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[150px] sm:min-w-[200px]">Task</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Assigned To</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Related To</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Priority</TableHead>
              <TableHead className="font-semibold text-gray-700">Submitted</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j} className={j === 0 ? "pl-4 py-3" : ""}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : allTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                  No tasks pending approval.
                </TableCell>
              </TableRow>
            ) : (
              allTasks.map((task, index: number) => {
                const prio = priorityConfig[task.priority as keyof typeof priorityConfig] ?? priorityConfig.medium
                return (
                  <TableRow key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell className="pl-4 py-3">
                      <Checkbox checked={selectedRows.has(task.id)} onCheckedChange={() => toggleRow(task.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{task.taskRef}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => setDrawerTaskId(task.id)}
                          className="text-sm text-primary hover:underline font-medium line-clamp-1 text-left"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600">
                        {task.categoryLabel || task.domain || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {task.assignee.avatarUrl && <AvatarImage src={task.assignee.avatarUrl} />}
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {getInitials(task.assignee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700 truncate max-w-[80px] sm:max-w-[120px]">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {task.relatedEntity ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-gray-600 truncate max-w-[80px] sm:max-w-[140px] block cursor-default">{task.relatedEntity.name}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="capitalize">{task.relatedEntity.type.replace("_", " ")}: {task.relatedEntity.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs border ${prio.className}`}>
                        {prio.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm text-amber-600 font-medium whitespace-nowrap">{formatRelativeDate(task.submittedAt)}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatShortDate(task.submittedAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" title="Approve" className="text-green-600 hover:text-green-700" onClick={() => setConfirmDialog({ type: "approve", taskIds: [task.id] })}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Reject" className="text-red-600 hover:text-red-700" onClick={() => setConfirmDialog({ type: "reject", taskIds: [task.id] })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Reassign" onClick={() => setConfirmDialog({ type: "reassign", taskIds: [task.id] })}>
                          <UserRoundPlus className="h-4 w-4" />
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
            <SelectTrigger className="w-16 h-8 text-sm"><SelectValue /></SelectTrigger>
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
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="px-2 py-1 border rounded text-center min-w-8">{page}</span>
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirm: Approve */}
      <Dialog open={confirmDialog?.type === "approve"} onOpenChange={(v) => !v && setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Approve {confirmDialog?.taskIds.length === 1 ? "Task" : "Tasks"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {confirmDialog?.taskIds.length === 1 ? "this task" : `${confirmDialog?.taskIds.length} tasks`}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-lg" disabled={isPending} onClick={() => confirmDialog && handleApprove(confirmDialog.taskIds)}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm: Reject */}
      <Dialog open={confirmDialog?.type === "reject"} onOpenChange={(v) => !v && setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Reject {confirmDialog?.taskIds.length === 1 ? "Task" : "Tasks"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {confirmDialog?.taskIds.length === 1 ? "this task" : `${confirmDialog?.taskIds.length} tasks`}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-lg" disabled={isPending} onClick={() => confirmDialog && handleReject(confirmDialog.taskIds)}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm: Reassign */}
      <Dialog open={confirmDialog?.type === "reassign"} onOpenChange={(v) => { if (!v) { setConfirmDialog(null); setReassigneeId("") } }}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Reassign {confirmDialog?.taskIds.length === 1 ? "Task" : "Tasks"}</DialogTitle>
            <DialogDescription>Select an employee to reassign to.</DialogDescription>
          </DialogHeader>
          <Select value={reassigneeId} onValueChange={setReassigneeId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select employee..." /></SelectTrigger>
            <SelectContent>
              {employees.map((e) => (<SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => { setConfirmDialog(null); setReassigneeId("") }}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg" disabled={isPending || !reassigneeId} onClick={() => confirmDialog && handleReassign(confirmDialog.taskIds)}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={drawerTaskId}
        open={drawerTaskId !== null}
        onClose={() => setDrawerTaskId(null)}
        onAction={(taskId, action, options) => {
          if (action === "approve") {
            handleApprove([taskId])
            setDrawerTaskId(null)
          } else if (action === "reject") {
            handleReject([taskId])
            setDrawerTaskId(null)
          } else if (action === "reassign") {
            setDrawerTaskId(null)
            setConfirmDialog({ type: "reassign", taskIds: [taskId] })
          } else if (action === "comment" && options?.comment) {
            taskActionMutation.mutate(
              {
                taskId,
                payload: { action: "comment", comment: options.comment },
              },
              {
                onSuccess: () => showToast("Comment added."),
                onError: (err) =>
                  showError(
                    isApiClientError(err)
                      ? getApiErrorMessage(err)
                      : "Failed to add comment."
                  ),
              }
            )
          }
        }}
      />
    </div>
  )
}
