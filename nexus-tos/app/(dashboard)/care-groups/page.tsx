"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { mockCareGroups } from "@/lib/mock-data"
import type { CareGroup } from "@/types"

type ColumnKey = "id" | "name" | "phoneNumber" | "email" | "reports"

interface ColumnDef {
  key: ColumnKey
  label: string
  filterable: boolean
}

const allColumns: ColumnDef[] = [
  { key: "id", label: "ID", filterable: true },
  { key: "name", label: "Care Group Name", filterable: true },
  { key: "phoneNumber", label: "Phone Number", filterable: true },
  { key: "email", label: "Email", filterable: true },
  { key: "reports", label: "Reports", filterable: false },
]

const defaultVisibleColumns: ColumnKey[] = ["id", "name", "phoneNumber", "email", "reports"]

const tabs = [
  { label: "Care Groups", href: "/care-groups", active: true },
  { label: "Settings", href: "/care-groups/settings", active: false },
] as const

export default function CareGroupsPage() {
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultVisibleColumns)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  // Filter by column search
  const filtered = useMemo(() => {
    return mockCareGroups.filter((cg) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue
        const cellValue = getCellValue(cg, key as ColumnKey)
        if (!cellValue.toLowerCase().includes(value.toLowerCase())) return false
      }
      return true
    })
  }, [filters])

  // Pagination
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

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
      setSelectedRows(new Set(paginated.map((cg) => cg.id)))
    }
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export as ${format}`, { visibleColumns, data: filtered })
  }

  const visibleColumnDefs = allColumns.filter((col) => visibleColumns.includes(col.key))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Care Groups</h1>
        <p className="text-gray-500 mt-1">
          Manage care groups and their assigned homes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex">
        {tabs.map((tab, index) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              tab.active
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${index === 0 ? "rounded-l-lg" : ""} ${index === tabs.length - 1 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" onClick={resetGrid} className="gap-1.5 text-primary">
            <RefreshCw className="size-3.5" />
            Reset Grid
          </Button>

          <span className="text-gray-300">|</span>

          <p className="text-sm text-gray-500">
            Drag a column header here to group by that column
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" size="sm" className="gap-1.5 text-primary">
              <Columns3 className="size-3.5" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Columns</h4>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search" className="pl-8 h-8 text-sm" />
            </div>
            <div className="space-y-2">
              {allColumns.map((col) => (
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

      {/* Export */}
      <div className="flex justify-end">
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
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className="min-w-160">
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
                    col.key === "id" ? "w-28" : ""
                  } ${col.key === "reports" ? "text-center" : ""}`}
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
                  {col.filterable && (
                    <div className={`relative ${col.key === "id" ? "max-w-24" : ""}`}>
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input
                        placeholder=""
                        value={filters[col.key] || ""}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        className="pl-6 h-6 text-xs border-gray-200"
                      />
                    </div>
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
                  No care groups found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((cg, index) => (
                <TableRow
                  key={cg.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                >
                  <TableCell className="pl-4 py-3.5">
                    <Checkbox
                      checked={selectedRows.has(cg.id)}
                      onCheckedChange={() => toggleRow(cg.id)}
                    />
                  </TableCell>
                  {visibleColumnDefs.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-3.5 ${col.key === "reports" ? "text-center" : ""}`}
                    >
                      {col.key === "name" ? (
                        <Link
                          href={`/care-groups/${cg.id}`}
                          className="text-primary hover:underline font-medium text-sm"
                        >
                          {cg.name}
                        </Link>
                      ) : col.key === "reports" ? (
                        <Link
                          href={`/care-groups/${cg.id}/reports`}
                          className="text-primary hover:underline font-medium text-sm"
                        >
                          Reports
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-700">
                          {getCellValue(cg, col.key)}
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

function getCellValue(cg: CareGroup, key: ColumnKey): string {
  switch (key) {
    case "id":
      return cg.id.toString()
    case "name":
      return cg.name
    case "phoneNumber":
      return cg.phoneNumber || ""
    case "email":
      return cg.email || ""
    case "reports":
      return "Reports"
    default:
      return ""
  }
}
