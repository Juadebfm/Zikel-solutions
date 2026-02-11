"use client"

import { useState, useMemo } from "react"
import {
  ScrollText,
  FileDown,
  FileText,
  FileSpreadsheet,
  User,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { ConfiguredInfo } from "@/components/task-explorer/configured-info"
import { statusColors } from "@/lib/constants"
import { mockTaskExplorerLogs } from "@/lib/mock-data"
import type { TaskExplorerFilters, TaskExplorerStatusOption } from "@/types"

interface TaskExplorerLogsProps {
  filters: TaskExplorerFilters
}

const statusLabels: Record<TaskExplorerStatusOption, string> = {
  submitted: "Submitted",
  draft: "Draft",
  "sent-for-approval": "Sent For Approval",
  approved: "Approved",
  rejected: "Rejected",
  "sent-for-deletion": "Sent For Deletion",
  deleted: "Deleted",
  "deleted-draft": "Deleted Draft",
  hidden: "Hidden",
}

function getStatusBadgeClasses(status: TaskExplorerStatusOption): string {
  const mapping: Record<string, keyof typeof statusColors> = {
    submitted: "pending",
    draft: "draft",
    "sent-for-approval": "pending",
    approved: "approved",
    rejected: "rejected",
    "sent-for-deletion": "overdue",
    deleted: "inactive",
    "deleted-draft": "inactive",
    hidden: "inactive",
  }
  const key = mapping[status] || "inactive"
  const colors = statusColors[key]
  return `${colors.bg} ${colors.text} ${colors.border} border`
}

export function TaskExplorerLogs({ filters }: TaskExplorerLogsProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  const filteredLogs = useMemo(() => {
    return mockTaskExplorerLogs.filter((log) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(log.status)) {
        return false
      }
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase()
        if (
          !log.title.toLowerCase().includes(kw) &&
          !log.relatesTo.toLowerCase().includes(kw) &&
          !log.formGroup.toLowerCase().includes(kw)
        ) {
          return false
        }
      }
      if (filters.taskId && !log.taskId.toString().includes(filters.taskId)) {
        return false
      }
      if (filters.forms.length > 0) {
        const formSlug = log.formGroup.toLowerCase().replace(/\s+/g, "-")
        if (!filters.forms.some((f) => formSlug.includes(f.replace(/\s+/g, "-")))) return false
      }
      return true
    })
  }, [filters])

  // Pagination
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSizeNum))
  const paginated = filteredLogs.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  // Row selection
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
      setSelectedRows(new Set(paginated.map((l) => l.id)))
    }
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export as ${format}`, { data: filteredLogs })
  }

  if (filteredLogs.length === 0) {
    return (
      <div className="space-y-6">
        <ConfiguredInfo filters={filters} />
        <div className="py-10">
          <div className="text-center">
            <ScrollText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No log entries match the current filters. Adjust your
              configuration to see results.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configured Information Summary */}
      <ConfiguredInfo filters={filters} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">
            {filteredLogs.length}
          </span>{" "}
          log {filteredLogs.length === 1 ? "entry" : "entries"}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="size-3.5" />
              Export
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
        <Table className="min-w-225">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={paginated.length > 0 && selectedRows.size === paginated.length}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-700 w-20">Task ID</TableHead>
              <TableHead className="font-semibold text-gray-700 min-w-55">Title</TableHead>
              <TableHead className="font-semibold text-gray-700">Form Group</TableHead>
              <TableHead className="font-semibold text-gray-700">Relates To</TableHead>
              <TableHead className="font-semibold text-gray-700">Home Or School</TableHead>
              <TableHead className="font-semibold text-gray-700">Task Date</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Originally Recorded At</TableHead>
              <TableHead className="font-semibold text-gray-700">Originally Recorded By</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Log History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((log, index) => (
              <TableRow
                key={log.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
              >
                <TableCell className="pl-4 py-3">
                  <Checkbox
                    checked={selectedRows.has(log.id)}
                    onCheckedChange={() => toggleRow(log.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm text-primary font-medium">
                  {log.taskId}
                </TableCell>
                <TableCell>
                  <button className="text-sm text-primary hover:underline font-medium text-left">
                    {log.title}
                  </button>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {log.formGroup}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    {log.relatesToIcon === "person" ? (
                      <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    ) : (
                      <Home className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    )}
                    {log.relatesTo}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {log.homeOrSchool}
                </TableCell>
                <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                  {log.taskDate}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={getStatusBadgeClasses(log.status)}
                  >
                    {statusLabels[log.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                  {log.originallyRecordedAt}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {log.originallyRecordedBy}
                </TableCell>
                <TableCell className="text-center">
                  <button className="text-xs text-primary hover:underline font-medium">
                    List Logs
                  </button>
                </TableCell>
              </TableRow>
            ))}
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
            <span className="hidden sm:inline">Showing </span>{pageSizeNum} per page
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
