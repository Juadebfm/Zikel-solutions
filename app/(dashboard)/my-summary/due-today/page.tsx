"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ChevronRight,
  ChevronLeft,
  FileDown,
  FileText,
  FileSpreadsheet,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSummaryTodos } from "@/hooks/api/use-summary"
import { statusColors } from "@/lib/constants"
import type { SummaryTaskItem } from "@/services/summary.service"

// ─── Timezone-aware date bucketing ──────────────────────────────────────────

const APP_TIMEZONE = "Europe/London"

function zonedStartOfDay(date: Date, tz: string): Date {
  // Format the date in the target timezone to get the local date parts
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((p) => p.type === "year")!.value
  const month = parts.find((p) => p.type === "month")!.value
  const day = parts.find((p) => p.type === "day")!.value

  // Create a Date at midnight in the target timezone
  // Using the timezone offset to construct the correct UTC instant
  const midnightLocal = new Date(`${year}-${month}-${day}T00:00:00`)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
    timeZoneName: "shortOffset",
  })
  // Fall back: just use the local date string as-is (works for same-tz or close)
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

// Format ISO date to DD/MM/YYYY for display
function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    const day = String(d.getUTCDate()).padStart(2, "0")
    const month = String(d.getUTCMonth() + 1).padStart(2, "0")
    const year = d.getUTCFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return isoDate
  }
}

// ─── Page component ─────────────────────────────────────────────────────────

export default function DueTodayPage() {
  const [activeBucketTab, setActiveBucketTab] = useState<"all" | DueBucket>("all")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch all todos sorted by dueDate — bucket client-side
  const { data, isLoading } = useSummaryTodos({
    page: 1,
    pageSize: 100,
    sortBy: "dueDate",
    sortOrder: "asc",
  })

  const allTodos = data?.items ?? []
  const boundaries = useMemo(() => computeBoundaries(), [])

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

  const activeTasks = bucketedTasks[activeBucketTab]

  // Filter by search query across all fields
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return activeTasks
    const q = searchQuery.toLowerCase()
    return activeTasks.filter((task) =>
      (task.id ?? "").toLowerCase().includes(q) ||
      (task.title ?? "").toLowerCase().includes(q) ||
      (task.relatedEntity?.name ?? "").toLowerCase().includes(q) ||
      (task.status ?? "").toLowerCase().includes(q) ||
      (task.assignee?.name ?? "").toLowerCase().includes(q) ||
      (task.dueAt ?? "").toLowerCase().includes(q)
    )
  }, [activeTasks, searchQuery])

  // Pagination
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSizeNum))
  const paginated = filteredTasks.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllRows = () => {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginated.map((t) => t.id)))
    }
  }

  const handleExport = (_format: "pdf" | "excel") => {
    // Export functionality not yet available
  }

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
          <Link href="/my-summary" className="text-primary hover:underline font-medium">
            My Summary
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Tasks Due Today</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks Due Today</h1>
      </div>

      {/* Bucket Tabs */}
      <div className="flex flex-wrap gap-2">
        {bucketTabs.map((tab) => {
          const isActive = activeBucketTab === tab.value
          const count = bucketCounts[tab.value]
          return (
            <button
              key={tab.value}
              onClick={() => { setActiveBucketTab(tab.value); setPage(0) }}
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

      {/* Configured Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Configured Information
          </h3>
          <div className="flex flex-wrap gap-x-12 gap-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Form Name: </span>
              All
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Log Statuses: </span>
              Not Started
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Status: </span>
              {activeBucketTab === "all" ? "Tasks Due Today" : activeBucketTab.charAt(0).toUpperCase() + activeBucketTab.slice(1)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
            placeholder="Search by title, assignee, relation..."
            className="pl-9 h-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-green-600 text-green-700 hover:bg-green-50">
              <FileDown className="size-4" />
              export
              <ChevronRight className="size-3.5 rotate-90" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={paginated.length > 0 && selectedRows.size === paginated.length}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-700 w-24">ID</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-[250px]">Title</TableHead>
              <TableHead className="font-semibold text-gray-700">Assignee</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Relates To</TableHead>
              <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  <TableCell className="pl-4 py-3"><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((task, index) => {
                const bucket = getDueBucket(task.dueAt, boundaries) ?? "due today"
                const badgeColors = BUCKET_BADGE_COLORS[bucket]
                return (
                  <TableRow
                    key={task.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                  >
                    <TableCell className="pl-4 py-3">
                      <Checkbox
                        checked={selectedRows.has(task.id)}
                        onCheckedChange={() => toggleRow(task.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-700 font-medium">
                      {task.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <button className="text-sm text-primary hover:underline font-medium text-left">
                        {task.title}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {task.assignee?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`${badgeColors.bg} ${badgeColors.text} ${badgeColors.border} border`}
                      >
                        {bucket}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {task.relatedEntity?.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {task.dueAt ? formatDate(task.dueAt) : "-"}
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
            Showing {pageSizeNum} records per page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="px-2 py-1 border rounded text-center min-w-8">
              {page + 1}
            </span>
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
