"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Loader2,
  Pencil,
  Trash2,
  UserRoundPlus,
  CalendarClock,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTaskList, useDeleteTask, useTaskAction } from "@/hooks/api/use-tasks"
import { useBatchArchive, useBatchPostpone, useBatchReassign } from "@/hooks/api/use-summary"
import { useEmployeesDropdown } from "@/hooks/api/use-dropdown-data"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import { statusColors } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { TaskListParams } from "@/services/tasks.service"

// ─── Types ───────────────────────────────────────────────────────

export type TaskAction = "edit" | "delete" | "reassign" | "postpone" | "submit" | "approve" | "reject"

interface SummaryTaskPageProps {
  title: string
  statusLabel: string
  statusKey: keyof typeof statusColors
  /** Query params passed to the tasks list API */
  queryParams: Partial<TaskListParams>
  /** Which row actions to show */
  actions: TaskAction[]
  /** Empty state message */
  emptyMessage?: string
  /** Optional callback when "Edit" is clicked */
  onEdit?: (taskId: string) => void
}

// ─── Component ───────────────────────────────────────────────────

export function SummaryTaskPage({
  title,
  statusLabel,
  statusKey,
  queryParams,
  actions,
  emptyMessage = "No tasks found.",
  onEdit,
}: SummaryTaskPageProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "delete" | "reassign" | "postpone"
    taskIds: string[]
  } | null>(null)
  const [reassigneeId, setReassigneeId] = useState("")

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  // Data
  const pageSizeNum = parseInt(pageSize)
  const { data, isLoading } = useTaskList({
    ...queryParams,
    page,
    pageSize: pageSizeNum,
    search: searchQuery || undefined,
  })

  const tasks = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? tasks.length

  // Mutations
  const deleteMutation = useDeleteTask()
  const taskActionMutation = useTaskAction()
  const batchArchiveMutation = useBatchArchive()
  const batchPostponeMutation = useBatchPostpone()
  const batchReassignMutation = useBatchReassign()
  const employeesQuery = useEmployeesDropdown()
  const employees = employeesQuery.data ?? []

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
    if (selectedRows.size === tasks.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(tasks.map((t) => t.id)))
    }
  }

  // Handlers
  const handleDelete = (ids: string[]) => {
    if (ids.length === 1) {
      deleteMutation.mutate(ids[0], {
        onSuccess: () => {
          showToast("Task deleted successfully.")
          setSelectedRows(new Set())
        },
        onError: (err) => showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete task."),
      })
    } else {
      batchArchiveMutation.mutate(
        { taskIds: ids },
        {
          onSuccess: (r) => {
            if (r.failed.length > 0) showError(`Deleted ${r.processed}, ${r.failed.length} failed.`)
            else showToast(`Deleted ${r.processed} task(s).`)
            setSelectedRows(new Set())
          },
          onError: (err) => showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete tasks."),
        }
      )
    }
    setConfirmDialog(null)
  }

  const handleReassign = (ids: string[]) => {
    if (!reassigneeId) {
      showError("Please select an employee to reassign to.")
      return
    }
    batchReassignMutation.mutate(
      { taskIds: ids, assigneeId: reassigneeId },
      {
        onSuccess: (r) => {
          if (r.failed.length > 0) showError(`Reassigned ${r.processed}, ${r.failed.length} failed.`)
          else showToast(`Reassigned ${r.processed} task(s).`)
          setSelectedRows(new Set())
          setReassigneeId("")
        },
        onError: (err) => showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to reassign tasks."),
      }
    )
    setConfirmDialog(null)
  }

  const handlePostpone = (ids: string[]) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    batchPostponeMutation.mutate(
      { taskIds: ids, dueDate: tomorrow.toISOString() },
      {
        onSuccess: (r) => {
          if (r.failed.length > 0) showError(`Postponed ${r.processed}, ${r.failed.length} failed.`)
          else showToast(`Postponed ${r.processed} task(s) to tomorrow.`)
          setSelectedRows(new Set())
        },
        onError: (err) => showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to postpone tasks."),
      }
    )
    setConfirmDialog(null)
  }

  const handleTaskAction = (taskId: string, action: "submit" | "approve" | "reject") => {
    taskActionMutation.mutate(
      { taskId, payload: { action } },
      {
        onSuccess: () => showToast(`Task ${action === "submit" ? "submitted" : action === "approve" ? "approved" : "rejected"} successfully.`),
        onError: (err) => showError(isApiClientError(err) ? getApiErrorMessage(err) : `Failed to ${action} task.`),
      }
    )
  }

  const isPending = deleteMutation.isPending || batchArchiveMutation.isPending || batchReassignMutation.isPending || batchPostponeMutation.isPending || taskActionMutation.isPending

  const colors = statusColors[statusKey] ?? statusColors.pending

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/my-summary" className="text-primary hover:underline font-medium">
            My Summary
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{title}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} border text-sm px-3 py-1`}>
            {totalItems} {totalItems === 1 ? "task" : "tasks"}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            placeholder="Search tasks..."
            className="pl-9 h-10"
          />
        </div>

        {/* Bulk actions */}
        {selectedRows.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{selectedRows.size} selected</span>
            {actions.includes("delete") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setConfirmDialog({ type: "delete", taskIds: Array.from(selectedRows) })}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            {actions.includes("reassign") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirmDialog({ type: "reassign", taskIds: Array.from(selectedRows) })}
              >
                <UserRoundPlus className="h-4 w-4" /> Reassign
              </Button>
            )}
            {actions.includes("postpone") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirmDialog({ type: "postpone", taskIds: Array.from(selectedRows) })}
              >
                <CalendarClock className="h-4 w-4" /> Postpone
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={tasks.length > 0 && selectedRows.size === tasks.length}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-700 w-20 sm:w-28">Ref</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[150px] sm:min-w-[200px]">Title</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Assignee</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Priority</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
              {actions.length > 0 && (
                <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <TableCell className="pl-4 py-3"><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  {actions.length > 0 && <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={actions.length > 0 ? 8 : 7} className="text-center py-10 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task, index) => (
                <TableRow key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <TableCell className="pl-4 py-3">
                    <Checkbox checked={selectedRows.has(task.id)} onCheckedChange={() => toggleRow(task.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-700 font-medium">{task.taskRef}</TableCell>
                  <TableCell>
                    <Link href={`/tasks?taskId=${task.id}`} className="text-sm text-primary hover:underline font-medium">
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden sm:table-cell">{task.assignee?.name ?? "-"}</TableCell>
                  <TableCell className="text-sm text-gray-600 capitalize hidden sm:table-cell">{task.priority}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} border`}>
                      {task.statusLabel ?? statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {task.dueAt ? formatDate(task.dueAt) : "-"}
                  </TableCell>
                  {actions.length > 0 && (
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {actions.includes("edit") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit"
                            onClick={() => onEdit?.(task.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes("submit") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Submit"
                            disabled={isPending}
                            onClick={() => handleTaskAction(task.id, "submit")}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes("approve") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Approve"
                            className="text-green-600 hover:text-green-700"
                            disabled={isPending}
                            onClick={() => handleTaskAction(task.id, "approve")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes("reject") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Reject"
                            className="text-red-600 hover:text-red-700"
                            disabled={isPending}
                            onClick={() => handleTaskAction(task.id, "reject")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes("reassign") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Reassign"
                            onClick={() => setConfirmDialog({ type: "reassign", taskIds: [task.id] })}
                          >
                            <UserRoundPlus className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes("postpone") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Postpone"
                            onClick={() => setConfirmDialog({ type: "postpone", taskIds: [task.id] })}
                          >
                            <CalendarClock className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes("delete") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setConfirmDialog({ type: "delete", taskIds: [task.id] })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
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
          <span className="text-xs sm:text-sm text-gray-500">
            Showing {pageSizeNum} per page
          </span>
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

      {/* Confirm Dialogs */}
      <Dialog open={confirmDialog?.type === "delete"} onOpenChange={(v) => !v && setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Delete {confirmDialog?.taskIds.length === 1 ? "Task" : "Tasks"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {confirmDialog?.taskIds.length === 1 ? "this task" : `${confirmDialog?.taskIds.length} tasks`}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={isPending}
              onClick={() => confirmDialog && handleDelete(confirmDialog.taskIds)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog?.type === "reassign"} onOpenChange={(v) => { if (!v) { setConfirmDialog(null); setReassigneeId("") } }}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Reassign {confirmDialog?.taskIds.length === 1 ? "Task" : "Tasks"}</DialogTitle>
            <DialogDescription>
              Select an employee to reassign {confirmDialog?.taskIds.length === 1 ? "this task" : `${confirmDialog?.taskIds.length} tasks`} to.
            </DialogDescription>
          </DialogHeader>
          <Select value={reassigneeId} onValueChange={setReassigneeId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => { setConfirmDialog(null); setReassigneeId("") }}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-lg"
              disabled={isPending || !reassigneeId}
              onClick={() => confirmDialog && handleReassign(confirmDialog.taskIds)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog?.type === "postpone"} onOpenChange={(v) => !v && setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Postpone {confirmDialog?.taskIds.length === 1 ? "Task" : "Tasks"}</DialogTitle>
            <DialogDescription>
              {confirmDialog?.taskIds.length === 1 ? "This task" : `${confirmDialog?.taskIds.length} tasks`} will be postponed to tomorrow at 9:00 AM.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-lg"
              disabled={isPending}
              onClick={() => confirmDialog && handlePostpone(confirmDialog.taskIds)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Postpone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
