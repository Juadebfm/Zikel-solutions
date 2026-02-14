"use client"

import { useState } from "react"
import {
  Search,
  RefreshCw,
  Columns3,
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { CategorySubTabs } from "@/components/homes/category-sub-tabs"
import { AuditDiffPanel } from "@/components/homes/audit-diff-panel"
import { getEmpAuditsByCategory } from "@/lib/mock-data"
import type { EmpAuditCategory } from "@/types"

const auditCategories: { key: string; label: string }[] = [
  { key: "genders", label: "Genders" },
  { key: "employment-types", label: "Employment Types" },
]

type AuditColumnKey = "event" | "createdBy" | "createdAt"

const auditColumns: { key: AuditColumnKey; label: string; filterable: boolean; filterType: "search" | "date" | "none" }[] = [
  { key: "event", label: "Event", filterable: true, filterType: "search" },
  { key: "createdBy", label: "Created By", filterable: true, filterType: "search" },
  { key: "createdAt", label: "Created At", filterable: true, filterType: "date" },
]

const defaultAuditColumns: AuditColumnKey[] = ["event", "createdBy", "createdAt"]

export function EmpAuditTab() {
  const [activeCategory, setActiveCategory] = useState<EmpAuditCategory>("genders")
  const [visibleColumns, setVisibleColumns] = useState<AuditColumnKey[]>(defaultAuditColumns)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  const allItems = getEmpAuditsByCategory(activeCategory)

  const filtered = allItems.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      let cellValue = ""
      if (key === "event") cellValue = item.event
      else if (key === "createdBy") cellValue = item.createdBy
      else if (key === "createdAt") cellValue = item.createdAt
      if (!cellValue.toLowerCase().includes(value.toLowerCase())) return false
    }
    return true
  })

  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key as EmpAuditCategory)
    setFilters({})
    setSelectedRows(new Set())
    setExpandedRows(new Set())
    setPage(0)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const toggleColumn = (col: AuditColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const resetGrid = () => {
    setVisibleColumns(defaultAuditColumns)
    setFilters({})
    setSelectedRows(new Set())
    setExpandedRows(new Set())
    setPage(0)
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
      setSelectedRows(new Set(paginated.map((a) => a.id)))
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export emp audit as ${format}`)
  }

  const visibleColumnDefs = auditColumns.filter((col) => visibleColumns.includes(col.key))

  return (
    <div className="space-y-6">
      {/* Category Sub-Tabs */}
      <CategorySubTabs
        tabs={auditCategories}
        activeTab={activeCategory}
        onTabChange={handleCategoryChange}
        initialVisibleCount={5}
      />

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
                {auditColumns.map((col) => (
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
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={paginated.length > 0 && selectedRows.size === paginated.length}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              {visibleColumnDefs.map((col) => (
                <TableHead key={col.key} className="font-semibold text-gray-700">
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
            {/* Filter row */}
            <TableRow>
              <TableHead className="pl-4" />
              {visibleColumnDefs.map((col) => (
                <TableHead key={`filter-${col.key}`} className="py-1">
                  {col.filterType === "search" && (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input placeholder="" className="pl-6 h-6 text-xs border-gray-200" onChange={(e) => handleFilterChange(col.key, e.target.value)} />
                    </div>
                  )}
                  {col.filterType === "date" && (
                    <Input type="text" placeholder="⇤" className="h-6 text-xs border-gray-200 text-center" onChange={(e) => handleFilterChange(col.key, e.target.value)} />
                  )}
                </TableHead>
              ))}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnDefs.length + 2}
                  className="text-center py-10 text-gray-400"
                >
                  No Data
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, index) => {
                const isExpanded = expandedRows.has(item.id)
                return (
                  <>
                    <TableRow
                      key={item.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                    >
                      <TableCell className="pl-4 py-3">
                        <Checkbox
                          checked={selectedRows.has(item.id)}
                          onCheckedChange={() => toggleRow(item.id)}
                        />
                      </TableCell>
                      {visibleColumnDefs.map((col) => (
                        <TableCell key={col.key} className="py-3">
                          {col.key === "event" && (
                            <span className="text-sm text-gray-700">{item.event}</span>
                          )}
                          {col.key === "createdBy" && (
                            <span className="text-sm text-gray-700">{item.createdBy}</span>
                          )}
                          {col.key === "createdAt" && (
                            <span className="text-sm text-gray-500 whitespace-nowrap">{item.createdAt}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="py-3">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${item.id}-diff`}>
                        <TableCell
                          colSpan={visibleColumnDefs.length + 2}
                          className="p-4 bg-gray-50/30"
                        >
                          <AuditDiffPanel before={item.before} after={item.after} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
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
