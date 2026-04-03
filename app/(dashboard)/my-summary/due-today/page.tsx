"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronLeft,
  Search,
  CalendarCheck,
  CalendarClock,
  AlertTriangle,
  Users,
  Clock,
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
import { useSummaryTodos } from "@/hooks/api/use-summary"
import { useBatchPostpone, useBatchReassign } from "@/hooks/api/use-summary"
import { useEmployeesDropdown } from "@/hooks/api/use-dropdown-data"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import { statusColors } from "@/lib/constants"
import { getInitials } from "@/lib/utils"
import type { SummaryTaskItem } from "@/services/summary.service"

// ─── Timezone-aware date bucketing ──────────────────────────────────────────

const APP_TIMEZONE = "Europe/London"

function zonedStartOfDay(date: Date, tz: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((p) => p.type === "year")!.value
  const month = parts.find((p) => p.type === "month")!.value
  const day = parts.find((p) => p.type === "day")!.value

  return new Date(`${year}-${month}-${day}T00:00:00.000Z`)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function inRange(isoDate: string, start: Date, end: Date): boolean {
  const d = new Date(isoDate)
  return d >= start && d < end
}

type DueBucket = "due today" | "due tomorrow" | "due next" | "upcoming"

function getDueBucket(dueDate: string | null | undefined, boundaries: DateBoundaries): DueBucket | null {
  if (!dueDate) return null
  if (inRange(dueDate, boundaries.startToday, boundaries.startTomorrow)) return "due today"
  if (inRange(dueDate, boundaries.startTomorrow, boundaries.startNext)) return "due tomorrow"
  if (inRange(dueDate, boundaries.startNext, boundaries.startAfterNext)) return "due next"
  return "upcoming"
}

interface DateBoundaries {
  startToday: Date
  startTomorrow: Date
  startNext: Date
  startAfterNext: Date
}

function computeBoundaries(): DateBoundaries {
  const startToday = zonedStartOfDay(new Date(), APP_TIMEZONE)
  return {
    startToday,
    startTomorrow: addDays(startToday, 1),
    startNext: addDays(startToday, 2),
    startAfterNext: addDays(startToday, 3),
  }
}

const BUCKET_BADGE_COLORS: Record<DueBucket, { bg: string; text: string; border: string }> = {
  "due today": statusColors["due-today"],
  "due tomorrow": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  "due next": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  upcoming: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
}

const BUCKET_LABELS: Record<DueBucket, string> = {
  "due today": "Today",
  "due tomorrow": "Tomorrow",
  "due next": "Next Day",
  upcoming: "Upcoming",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const priorityConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "Low", className: "bg-green-100 text-green-700 border-green-200" },
} as const

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Page component ─────────────────────────────────────────────────────────

export default function DueTodayPage() {
  const [activeBucketTab, setActiveBucketTab] = useState<"all" | DueBucket>("due today")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
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

  // Fetch all todos sorted by dueDate -- bucket client-side
  const { data, isLoading } = useSummaryTodos({
    page: 1,
    pageSize: 100,
    sortBy: "dueDate",
    sortOrder: "asc",
  })

  const allTodos = data?.items ?? []
  const boundaries = useMemo(() => computeBoundaries(), [])

  // Mutations
  const batchPostponeMutation = useBatchPostpone()
  const batchReassignMutation = useBatchReassign()
  const employeesQuery = useEmployeesDropdown()
  const employees = employeesQuery.data ?? []

  // Bucket tasks by dueDate
  const { bucketedTasks, bucketCounts } = useMemo(() => {
    const buckets: Record<DueBucket | "all", SummaryTaskItem[]> = {
      "all": [],
      "due today": [],
      "due tomorrow": [],
      "due next": [],
      upcoming: [],
    }

    for (const task of allTodos) {
      const bucket = getDueBucket(task.dueAt, boundaries)
      if (bucket) {
        buckets[bucket].push(task)
        buckets["all"].push(task)
      }
    }

    return {
      bucketedTasks: buckets,
      bucketCounts: {
        "all": buckets["all"].length,
        "due today": buckets["due today"].length,
        "due tomorrow": buckets["due tomorrow"].length,
        "due next": buckets["due next"].length,
        upcoming: buckets["upcoming"].length,
      },
    }
  }, [allTodos, boundaries])

  // Summary stats
  const summary = useMemo(() => {
    const all = bucketedTasks["all"]
    const unassigned = all.filter((t) => !t.assignee).length
    let urgentHigh = 0
    for (const t of all) {
      if (t.priority === "urgent" || t.priority === "high") urgentHigh++
    }
    return {
      dueToday: bucketCounts["due today"],
      dueTomorrow: bucketCounts["due tomorrow"],
      unassigned,
      urgentHigh,
    }
  }, [bucketedTasks, bucketCounts])

  const activeTasks = bucketedTasks[activeBucketTab]

  // Filter by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return activeTasks
    const q = searchQuery.toLowerCase()
    return activeTasks.filter((task) =>
      (task.taskRef ?? "").toLowerCase().includes(q) ||
      (task.title ?? "").toLowerCase().includes(q) ||
      (task.relatedEntity?.name ?? "").toLowerCase().includes(q) ||
      (task.assignee?.name ?? "").toLowerCase().includes(q) ||
      (task.categoryLabel ?? "").toLowerCase().includes(q)
    )
  }, [activeTasks, searchQuery])

  // Pagination
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSizeNum))
  const paginated = filteredTasks.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

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
    if (selectedRows.size === paginated.length) setSelectedRows(new Set())
    else setSelectedRows(new Set(paginated.map((t) => t.id)))
  }

  // Handlers
  const isPending = batchPostponeMutation.isPending || batchReassignMutation.isPending

  const handlePostpone = (ids: string[]) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next })
    batchPostponeMutation.mutate({ taskIds: ids, dueDate: tomorrow.toISOString() }, {
      onSuccess: (r) => {
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
        if (r.failed.length > 0) showError(`Postponed ${r.processed}, ${r.failed.length} failed.`)
        else showToast(`Postponed ${r.processed} task(s) to tomorrow.`)
        setSelectedRows(new Set())
      },
      onError: (err) => {
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
        showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to postpone tasks.")
      },
    })
    setConfirmDialog(null)
  }

  const handleReassign = (ids: string[]) => {
    if (!reassigneeId) { showError("Please select an employee."); return }
    setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next })
    batchReassignMutation.mutate({ taskIds: ids, assigneeId: reassigneeId }, {
      onSuccess: (r) => {
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
        if (r.failed.length > 0) showError(`Reassigned ${r.processed}, ${r.failed.length} failed.`)
        else showToast(`Reassigned ${r.processed} task(s).`)
        setSelectedRows(new Set())
        setReassigneeId("")
      },
      onError: (err) => {
        setProcessingTaskIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next })
        showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to reassign tasks.")
      },
    })
    setConfirmDialog(null)
  }

  const colors = statusColors["due-today"]

  const bucketTabs: { label: string; value: "all" | DueBucket }[] = [
    { label: "All", value: "all" },
    { label: "Due Today", value: "due today" },
    { label: "Due Tomorrow", value: "due tomorrow" },
    { label: "Due Next Day", value: "due next" },
    { label: "Upcoming", value: "upcoming" },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/my-summary" className="text-primary hover:underline font-medium">My Summary</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Tasks Due Today</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Tasks Due Today</h1>
          <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} border text-sm px-3 py-1`}>
            {bucketCounts["all"]} tasks
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><CalendarCheck className="h-4 w-4 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.dueToday}</p>
              <p className="text-xs text-gray-500">Due Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100"><Clock className="h-4 w-4 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.dueTomorrow}</p>
              <p className="text-xs text-gray-500">Due Tomorrow</p>
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
              <p className="text-2xl font-bold text-gray-900">{summary.urgentHigh}</p>
              <p className="text-xs text-gray-500">Urgent / High</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Tabs */}
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        {bucketTabs.map((tab) => {
          const isActive = activeBucketTab === tab.value
          const count = bucketCounts[tab.value]
          return (
            <button
              key={tab.value}
              onClick={() => { setActiveBucketTab(tab.value); setPage(0); setSelectedRows(new Set()) }}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                isActive
                  ? "bg-[#1B2559] text-white border-[#1B2559]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
            placeholder="Search by title, ref, assignee, entity..."
            className="pl-9 h-10"
          />
        </div>

        {/* Bulk actions */}
        {selectedRows.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{selectedRows.size} selected</span>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirmDialog({ type: "postpone", taskIds: Array.from(selectedRows) })}>
              <CalendarClock className="h-4 w-4" /> Postpone
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
                <Checkbox checked={paginated.length > 0 && selectedRows.size === paginated.length} onCheckedChange={toggleAllRows} />
              </TableHead>
              <TableHead className="font-semibold text-gray-700 w-20 sm:w-28">Ref</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[150px] sm:min-w-[200px]">Task</TableHead>
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
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((task, index) => {
                const isProcessing = processingTaskIds.has(task.id)

                if (isProcessing) {
                  return (
                    <TableRow key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                      <TableCell className="pl-4 py-3"><Skeleton className="h-4 w-4 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-[140px] sm:w-[180px]" />
                          <Skeleton className="h-3 w-[100px] sm:w-[140px]" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-[80px]" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-14 rounded-full mx-auto" /></TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  )
                }

                const bucket = getDueBucket(task.dueAt, boundaries) ?? "due today"
                const badgeColors = BUCKET_BADGE_COLORS[bucket]
                const prio = priorityConfig[task.priority as keyof typeof priorityConfig] ?? priorityConfig.medium
                return (
                  <TableRow key={task.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell className="pl-4 py-3">
                      <Checkbox checked={selectedRows.has(task.id)} onCheckedChange={() => toggleRow(task.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{task.taskRef}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Link href={`/tasks?taskId=${task.id}`} className="text-sm text-primary hover:underline font-medium line-clamp-1">
                          {task.title}
                        </Link>
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
                        <Badge variant="outline" className={`text-xs border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}>
                          {BUCKET_LABELS[bucket]}
                        </Badge>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatShortDate(task.dueAt)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-4 w-4" title="Postpone" onClick={() => setConfirmDialog({ type: "postpone", taskIds: [task.id] })}>
                          <CalendarClock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-4 w-4" title="Reassign" onClick={() => setConfirmDialog({ type: "reassign", taskIds: [task.id] })}>
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
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(0) }}>
            <SelectTrigger className="w-16 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs sm:text-sm text-gray-500">Showing {pageSizeNum} records per page</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="px-2 py-1 border rounded text-center min-w-8">{page + 1}</span>
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
    </div>
  )
}
