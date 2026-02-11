"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  RefreshCw,
  Columns3,
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Info,
  User as UserIcon,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { mockEmployees } from "@/lib/mock-data"
import type { EmployeeStatus } from "@/types"

type StatusTab = "all" | "current" | "past" | "planned"

type EmpColumnKey = "id" | "details" | "name" | "jobTitle" | "status" | "reports" | "createTask" | "viewRota"

const empColumns: { key: EmpColumnKey; label: string; filterable: boolean; filterType: "search" | "select" | "none" }[] = [
  { key: "id", label: "ID", filterable: true, filterType: "search" },
  { key: "details", label: "Details", filterable: false, filterType: "none" },
  { key: "name", label: "Employee Name", filterable: true, filterType: "search" },
  { key: "jobTitle", label: "Job Title", filterable: true, filterType: "search" },
  { key: "status", label: "Status", filterable: true, filterType: "select" },
  { key: "reports", label: "Reports", filterable: false, filterType: "none" },
  { key: "createTask", label: "Create Task", filterable: false, filterType: "none" },
  { key: "viewRota", label: "View Rota", filterable: false, filterType: "none" },
]

const defaultEmpColumns: EmpColumnKey[] = ["id", "details", "name", "jobTitle", "status", "reports", "createTask", "viewRota"]

const empStatusBadge: Record<EmployeeStatus, { bg: string; text: string }> = {
  current: { bg: "bg-green-600", text: "text-white" },
  past: { bg: "bg-gray-400", text: "text-white" },
  planned: { bg: "bg-blue-500", text: "text-white" },
}

export function EmployeesTab() {
  const [statusTab, setStatusTab] = useState<StatusTab>("all")
  const [visibleColumns, setVisibleColumns] = useState<EmpColumnKey[]>(defaultEmpColumns)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  const allEmployees = mockEmployees

  const statusFiltered = statusTab === "all" ? allEmployees : allEmployees.filter((e) => e.status === statusTab)

  const filtered = statusFiltered.filter((emp) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      let cellValue = ""
      if (key === "id") cellValue = emp.id.toString()
      else if (key === "name") cellValue = `${emp.firstName} ${emp.lastName}`
      else if (key === "jobTitle") cellValue = emp.jobTitle
      else if (key === "status") {
        if (value !== "all" && emp.status !== value) return false
        continue
      }
      if (cellValue && !cellValue.toLowerCase().includes(value.toLowerCase())) return false
    }
    return true
  })

  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  // Group by location (homeName)
  const grouped = paginated.reduce<Record<string, typeof paginated>>((acc, emp) => {
    const loc = emp.homeName || "Unassigned"
    if (!acc[loc]) acc[loc] = []
    acc[loc].push(emp)
    return acc
  }, {})

  const statusTabCounts = {
    all: allEmployees.length,
    current: allEmployees.filter((e) => e.status === "current").length,
    past: allEmployees.filter((e) => e.status === "past").length,
    planned: allEmployees.filter((e) => e.status === "planned").length,
  }

  const handleTabChange = (tab: StatusTab) => {
    setStatusTab(tab)
    setPage(0)
    setSelectedRows(new Set())
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const toggleColumn = (col: EmpColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const resetGrid = () => {
    setVisibleColumns(defaultEmpColumns)
    setFilters({})
    setSelectedRows(new Set())
    setPage(0)
    setStatusTab("all")
  }

  const toggleRow = (id: number) => {
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
      setSelectedRows(new Set(paginated.map((e) => e.id)))
    }
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export employees as ${format}`)
  }

  const visibleColumnDefs = empColumns.filter((col) => visibleColumns.includes(col.key))

  let rowIndex = 0

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="flex">
        {(["all", "current", "past", "planned"] as const).map((tab, index) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              statusTab === tab
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${index === 0 ? "rounded-l-lg" : ""} ${index === 3 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({statusTabCounts[tab]})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="gap-1.5 text-primary" onClick={resetGrid}>
            <RefreshCw className="size-3.5" />
            Reset Grid
          </Button>
          <span className="text-gray-300">|</span>
          <p className="text-sm text-gray-500">
            Drag a column header here to group by that column
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/employees/create">
            <Button variant="default" size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="size-3.5" />
              Add
            </Button>
          </Link>

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
                Export As PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                Export As Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" size="sm" className="gap-2 bg-red-500 hover:bg-red-600">
            Actions
          </Button>
        </div>
      </div>

      {/* Columns popover */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" size="sm" className="gap-1.5 text-primary">
              <Columns3 className="size-3.5" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <h4 className="font-medium text-sm mb-3">Columns</h4>
            <div className="space-y-2">
              {empColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibleColumns.includes(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  <span className="text-sm">{col.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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
              {visibleColumnDefs.map((col) => (
                <TableHead
                  key={col.key}
                  className={`font-semibold text-gray-700 ${
                    col.key === "id" ? "w-20" : ""
                  } ${col.key === "details" ? "w-16" : ""
                  } ${col.key === "status" || col.key === "reports" || col.key === "createTask" || col.key === "viewRota" ? "text-center" : ""}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
            {/* Filter row */}
            <TableRow>
              <TableHead className="pl-4" />
              {visibleColumnDefs.map((col) => (
                <TableHead key={`filter-${col.key}`} className="py-1">
                  {col.filterType === "search" && (
                    <div className={`relative ${col.key === "id" ? "max-w-16" : ""}`}>
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input placeholder="" className="pl-6 h-6 text-xs border-gray-200" onChange={(e) => handleFilterChange(col.key, e.target.value)} />
                    </div>
                  )}
                  {col.filterType === "select" && (
                    <Select defaultValue="all" onValueChange={(v) => handleFilterChange(col.key, v)}>
                      <SelectTrigger className="h-6 text-xs border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnDefs.length + 1}
                  className="text-center py-10 text-gray-400"
                >
                  No Data
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(grouped).map(([location, employees]) => (
                <>
                  {/* Location group header */}
                  <TableRow key={`group-${location}`}>
                    <TableCell
                      colSpan={visibleColumnDefs.length + 1}
                      className="bg-gray-100 py-2 px-4 font-semibold text-sm text-gray-700"
                    >
                      Location: {location}
                    </TableCell>
                  </TableRow>
                  {employees.map((emp) => {
                    const idx = rowIndex++
                    return (
                      <TableRow
                        key={emp.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                      >
                        <TableCell className="pl-4 py-3">
                          <Checkbox
                            checked={selectedRows.has(emp.id)}
                            onCheckedChange={() => toggleRow(emp.id)}
                          />
                        </TableCell>
                        {visibleColumnDefs.map((col) => (
                          <TableCell
                            key={col.key}
                            className={`py-3 ${col.key === "status" || col.key === "reports" || col.key === "createTask" || col.key === "viewRota" ? "text-center" : ""}`}
                          >
                            {col.key === "id" && (
                              <span className="text-sm text-gray-700">{emp.id}</span>
                            )}
                            {col.key === "details" && (
                              <button className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100">
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {col.key === "name" && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-300">
                                  <UserIcon className="h-3.5 w-3.5 text-gray-600" />
                                </div>
                                <Link
                                  href={`/employees/${emp.id}`}
                                  className="text-sm text-primary hover:underline font-medium"
                                >
                                  {emp.firstName} {emp.lastName}
                                </Link>
                              </div>
                            )}
                            {col.key === "jobTitle" && (
                              <span className="text-sm text-gray-700">{emp.jobTitle}</span>
                            )}
                            {col.key === "status" && (
                              <Badge className={`${empStatusBadge[emp.status].bg} ${empStatusBadge[emp.status].text} hover:opacity-90`}>
                                {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                              </Badge>
                            )}
                            {col.key === "reports" && (
                              <Link href="#" className="text-sm text-primary hover:underline font-medium">
                                Reports
                              </Link>
                            )}
                            {col.key === "createTask" && (
                              <Link href="#" className="text-sm text-primary hover:underline font-medium">
                                Create Task
                              </Link>
                            )}
                            {col.key === "viewRota" && (
                              <Link href="#" className="text-sm text-primary hover:underline font-medium">
                                View Rota
                              </Link>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
    </div>
  )
}
