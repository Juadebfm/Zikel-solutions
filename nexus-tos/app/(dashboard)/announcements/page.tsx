"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  RefreshCw,
  Columns3,
  FileDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { mockAnnouncements, type Announcement } from "@/data/mock-announcements"

type ColumnKey = "id" | "title" | "startsAt" | "endsAt" | "status" | "message"

interface ColumnDef {
  key: ColumnKey
  label: string
  filterable: boolean
  filterType: "search" | "date" | "none"
}

const allColumns: ColumnDef[] = [
  { key: "id", label: "ID", filterable: true, filterType: "search" },
  { key: "title", label: "Title", filterable: true, filterType: "search" },
  { key: "startsAt", label: "Starts At", filterable: true, filterType: "date" },
  { key: "endsAt", label: "Ends At", filterable: true, filterType: "date" },
  { key: "status", label: "Status", filterable: true, filterType: "search" },
  { key: "message", label: "Message", filterable: false, filterType: "none" },
]

const defaultVisibleColumns: ColumnKey[] = ["id", "title", "startsAt", "endsAt", "status", "message"]

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all")
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultVisibleColumns)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  // Filter by tab
  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return mockAnnouncements
    return mockAnnouncements.filter((a) => a.status === activeTab)
  }, [activeTab])

  // Filter by column search
  const filtered = useMemo(() => {
    return tabFiltered.filter((announcement) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue
        const cellValue = getCellValue(announcement, key as ColumnKey)
        if (!cellValue.toLowerCase().includes(value.toLowerCase())) return false
      }
      return true
    })
  }, [tabFiltered, filters])

  // Pagination
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  // Reset page on filter/tab change
  const handleTabChange = (tab: "all" | "unread" | "read") => {
    setActiveTab(tab)
    setPage(0)
    setSelectedRows(new Set())
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  // Column toggle
  const toggleColumn = (col: ColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const resetGrid = () => {
    setVisibleColumns(defaultVisibleColumns)
    setFilters({})
    setSelectedRows(new Set())
    setPage(0)
  }

  // Row selection
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
      setSelectedRows(new Set(paginated.map((a) => a.id)))
    }
  }

  // Export
  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export as ${format}`, { visibleColumns, data: filtered })
  }

  const visibleColumnDefs = allColumns.filter((col) => visibleColumns.includes(col.key))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">
          View and manage system announcements and updates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex">
        {(["all", "unread", "read"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              activeTab === tab
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${tab === "all" ? "rounded-l-lg" : ""} ${tab === "read" ? "rounded-r-lg" : ""} ${tab !== "all" ? "-ml-px" : ""}`}
          >
            {capitalize(tab)}
          </button>
        ))}
      </div>

      {/* Toolbar: reset grid + columns on left, export on right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetGrid} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Reset Grid
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Columns3 className="size-3.5" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Columns</h4>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search"
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                {allColumns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
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
        <Table className="min-w-[640px]">
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
                  } ${col.key === "status" ? "text-center" : ""
                  } ${col.key === "message" ? "pr-6 text-right" : ""}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
            {/* Filter row */}
            <TableRow>
              <TableHead className="pl-4" />
              {visibleColumnDefs.map((col) => (
                <TableHead
                  key={`filter-${col.key}`}
                  className={`py-1 ${col.key === "message" ? "pr-6" : ""}`}
                >
                  {col.filterType === "search" && (
                    <div className={`relative ${col.key === "id" ? "max-w-16" : ""} ${col.key === "status" ? "max-w-24 mx-auto" : ""}`}>
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        placeholder=""
                        value={filters[col.key] || ""}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        className="pl-7 h-7 text-xs border-gray-200"
                      />
                    </div>
                  )}
                  {col.filterType === "date" && (
                    <Input
                      type="text"
                      placeholder="&#x21A4;"
                      value={filters[col.key] || ""}
                      onChange={(e) => handleFilterChange(col.key, e.target.value)}
                      className="h-7 text-xs border-gray-200 text-center"
                    />
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
                  No announcements found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((announcement, index) => (
                <TableRow
                  key={announcement.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                >
                  <TableCell className="pl-4 py-3.5">
                    <Checkbox
                      checked={selectedRows.has(announcement.id)}
                      onCheckedChange={() => toggleRow(announcement.id)}
                    />
                  </TableCell>
                  {visibleColumnDefs.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-3.5 ${
                        col.key === "status" ? "text-center" : ""
                      } ${col.key === "message" ? "pr-6 text-right" : ""}`}
                    >
                      {col.key === "status" ? (
                        <Badge
                          className={
                            announcement.status === "read"
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }
                        >
                          {capitalize(announcement.status)}
                        </Badge>
                      ) : col.key === "message" ? (
                        <Link
                          href={`/announcements/${announcement.id}`}
                          className="text-primary hover:underline font-medium text-sm"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-700">
                          {getCellValue(announcement, col.key)}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
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
            <span className="px-2 py-1 border rounded text-center min-w-[2rem]">
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

function getCellValue(announcement: Announcement, key: ColumnKey): string {
  switch (key) {
    case "id":
      return announcement.id.toString()
    case "title":
      return announcement.title
    case "startsAt":
      return announcement.startsAt
    case "endsAt":
      return announcement.endsAt
    case "status":
      return announcement.status
    case "message":
      return "View"
    default:
      return ""
  }
}
