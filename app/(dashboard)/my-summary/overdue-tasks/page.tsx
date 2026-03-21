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
import { useSummaryOverdueTasks } from "@/hooks/api/use-summary"
import { statusColors } from "@/lib/constants"
export default function OverdueTasksPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useSummaryOverdueTasks({
    page: page + 1,
    pageSize: parseInt(pageSize),
    formGroup: activeTab === "all" ? undefined : activeTab,
  })

  const allTasks = data?.items ?? []

  // Derive unique form group tabs from the tasks
  const formGroupTabs = useMemo(() => {
    const groups = new Set(allTasks.map((t) => t.formGroup).filter(Boolean))
    return ["All", ...Array.from(groups)]
  }, [allTasks])

  // Filter by active tab
  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return allTasks
    return allTasks.filter((t) => t.formGroup === activeTab)
  }, [allTasks, activeTab])

  // Filter by search query across all fields
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tabFiltered
    const q = searchQuery.toLowerCase()
    return tabFiltered.filter((task) =>
      (task.taskRef ?? "").toLowerCase().includes(q) ||
      (task.title ?? "").toLowerCase().includes(q) ||
      (task.formGroup ?? "").toLowerCase().includes(q) ||
      (task.status ?? "").toLowerCase().includes(q) ||
      (task.relatesTo ?? "").toLowerCase().includes(q) ||
      (task.taskDate ?? "").toLowerCase().includes(q)
    )
  }, [tabFiltered, searchQuery])

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

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export as ${format}`, { data: filteredTasks })
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/my-summary" className="text-primary hover:underline font-medium">
            My Summary
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Overdue Tasks</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Overdue Tasks</h1>
      </div>

      {/* Form Group Tabs */}
      <div className="flex flex-wrap gap-2">
        {formGroupTabs.map((tab) => {
          const tabValue = tab === "All" ? "all" : tab
          const isActive = activeTab === tabValue
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tabValue); setPage(0) }}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                isActive
                  ? "bg-[#1B2559] text-white border-[#1B2559]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {(tab ?? "").length > 15 ? `${tab.slice(0, 15)}...` : tab}
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
              {activeTab === "all" ? "All" : activeTab}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Log Statuses: </span>
              Not Started
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Status: </span>
              Overdue Tasks
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
            placeholder="Search by ID, title, form group, relates to..."
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
              <TableHead className="font-semibold text-gray-700">Form Group</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Relates To</TableHead>
              <TableHead className="font-semibold text-gray-700">Task Date</TableHead>
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
                  No overdue tasks found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((task, index) => (
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
                    {task.taskRef}
                  </TableCell>
                  <TableCell>
                    <button className="text-sm text-primary hover:underline font-medium text-left">
                      {task.title}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {task.formGroup}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`${statusColors.overdue.bg} ${statusColors.overdue.text} ${statusColors.overdue.border} border`}
                    >
                      overdue
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {task.relatesTo}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {task.taskDate}
                  </TableCell>
                </TableRow>
              ))
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
