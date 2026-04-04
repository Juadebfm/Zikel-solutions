"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  ChevronLeft,
  Search,
  CalendarDays,
  Calendar,
  AlertTriangle,
  Users,
  Pencil,
  UserRoundPlus,
  CalendarClock,
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
import { useTaskList } from "@/hooks/api/use-tasks"
import { useBatchPostpone, useBatchReassign } from "@/hooks/api/use-summary"
import { useEmployeesDropdown } from "@/hooks/api/use-dropdown-data"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import { statusColors } from "@/lib/constants"
import { getInitials } from "@/lib/utils"

// ─── Helpers ─────────────────────────────────────────────────────

const priorityConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "Low", className: "bg-green-100 text-green-700 border-green-200" },
} as const

function formatFutureRelative(iso: string | null): string {
  if (!iso) return "-"
  const d = new Date(iso)
  const diffDays = Math.ceil((d.getTime() - Date.now()) / 86_400_000)
  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays < 7) return `in ${diffDays} days`
  if (diffDays < 14) return "in 1 week"
  if (diffDays < 30) return `in ${Math.floor(diffDays / 7)} weeks`
  return `in ${Math.floor(diffDays / 30)} months`
}

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Component ───────────────────────────────────────────────────

export default function FutureTasksPage() {
  const router = useRouter()
  const [summaryNowMs] = useState(() => Date.now())
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "reassign" | "postpone"
    taskIds: string[]
  } | null>(null)
  const [reassigneeId, setReassigneeId] = useState("")
  const [processingTaskIds, setProcessingTaskIds] = useState<Set<string>>(new Set())

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const pageSizeNum = parseInt(pageSize)
  const { data, isLoading } = useTaskList({
    summaryScope: "future",
    page,
    pageSize: pageSizeNum,
    search: searchQuery || undefined,
    sortBy: "dueAt",
    sortOrder: "asc",
  })

  const allTasks = data?.items ?? []
  const meta = data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const totalItems = meta?.total ?? allTasks.length

  // Mutations
  const batchPostponeMutation = useBatchPostpone()
  const batchReassignMutation = useBatchReassign()
  const employeesQuery = useEmployeesDropdown()
  const employees = employeesQuery.data ?? []

  // Summary stats
  const summary = useMemo(() => {
    const priorities = { urgent: 0, high: 0, medium: 0, low: 0 }
    const unassigned = allTasks.filter((t) => !t.assignee).length

    const sevenDaysMs = 7 * 86_400_000
    const thisWeek = allTasks.filter((t) => {
      if (!t.dueAt) return false
      const diff = new Date(t.dueAt).getTime() - summaryNowMs
      return diff >= 0 && diff <= sevenDaysMs
    }).length

    for (const t of allTasks) {
      if (t.priority in priorities) priorities[t.priority as keyof typeof priorities]++
    }

    return { priorities, unassigned, thisWeek }
  }, [allTasks, summaryNowMs])

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
  const isPending = batchPostponeMutation.isPending || batchReassignMutation.isPending

  const handlePostpone = (ids: string[]) => {
    setProcessingTaskIds((prev) => new Set([...prev, ...ids]))
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    batchPostponeMutation.mutate({ taskIds: ids, dueDate: tomorrow.toISOString() }, {
      onSuccess: (r) => {
        if (r.failed.length > 0) showError(`Postponed ${r.processed}, ${r.failed.length} failed.`)
        else showToast(`Postponed ${r.processed} task(s) to tomorrow.`)
        setSelectedRows(new Set())
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
      },
      onError: (err) => {
        showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to postpone tasks.")
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
      },
    })
    setConfirmDialog(null)
  }

  const handleReassign = (ids: string[]) => {
    if (!reassigneeId) { showError("Please select an employee."); return }
    setProcessingTaskIds((prev) => new Set([...prev, ...ids]))
    batchReassignMutation.mutate({ taskIds: ids, assigneeId: reassigneeId }, {
      onSuccess: (r) => {
        if (r.failed.length > 0) showError(`Reassigned ${r.processed}, ${r.failed.length} failed.`)
        else showToast(`Reassigned ${r.processed} task(s).`)
        setSelectedRows(new Set())
        setReassigneeId("")
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
      },
      onError: (err) => {
        showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to reassign tasks.")
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
      },
    })
    setConfirmDialog(null)
  }

  const colors = statusColors.future

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/my-summary" className="text-primary hover:underline font-medium">My Summary</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Future Tasks</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Future Tasks</h1>
          <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} border text-sm px-3 py-1`}>
            {totalItems} future
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><CalendarDays className="h-4 w-4 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-xs text-gray-500">Total Future</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Calendar className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.thisWeek}</p>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><Users className="h-4 w-4 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.unassigned}</p>
              <p className="text-xs text-gray-500">Unassigned</p>
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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirmDialog({ type: "reassign", taskIds: Array.from(selectedRows) })}>
              <UserRoundPlus className="h-4 w-4" /> Reassign
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirmDialog({ type: "postpone", taskIds: Array.from(selectedRows) })}>
              <CalendarClock className="h-4 w-4" /> Postpone
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
              <TableHead className="font-semibold text-gray-700 min-w-[150px] sm:min-w-[200px] max-w-[300px]">Task</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Assigned To</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Related To</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Priority</TableHead>
              <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
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
                  No future tasks found.
                </TableCell>
              </TableRow>
            ) : (
              allTasks.map((task, index) => {
                const prio = priorityConfig[task.priority as keyof typeof priorityConfig] ?? priorityConfig.medium
                const isProcessing = processingTaskIds.has(task.id)
                return isProcessing ? (
                  <TableRow key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-4 py-3" : ""}>
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ) : (
                  <TableRow key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell className="pl-4 py-3">
                      <Checkbox checked={selectedRows.has(task.id)} onCheckedChange={() => toggleRow(task.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{task.taskRef}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/tasks?taskId=${task.id}`} className="text-sm text-primary hover:underline font-medium truncate block w-full">
                          {task.title}
                        </Link>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate">{task.description}</p>
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
                        <p className="text-sm text-green-600 font-medium whitespace-nowrap">{formatFutureRelative(task.dueAt)}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatShortDate(task.dueAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-4 w-4" title="Edit" onClick={() => router.push(`/tasks?taskId=${task.id}`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-4 w-4" title="Reassign" onClick={() => setConfirmDialog({ type: "reassign", taskIds: [task.id] })}>
                          <UserRoundPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-4 w-4" title="Postpone" onClick={() => setConfirmDialog({ type: "postpone", taskIds: [task.id] })}>
                          <CalendarClock className="h-4 w-4" />
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

      {/* Confirm: Postpone */}
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
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg" disabled={isPending} onClick={() => confirmDialog && handlePostpone(confirmDialog.taskIds)}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Postpone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
