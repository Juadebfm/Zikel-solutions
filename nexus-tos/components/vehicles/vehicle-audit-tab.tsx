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
import { getVehicleAuditsByCategory } from "@/lib/mock-data"
import type { VehicleAuditCategory } from "@/types"

const auditCategories: { key: VehicleAuditCategory; label: string }[] = [
  { key: "file-categories", label: "File Categories" },
  { key: "custom-information-groups", label: "Custom Information Groups" },
  { key: "custom-information-fields", label: "Custom Information Fields" },
]

export function VehicleAuditTab() {
  const [activeCategory, setActiveCategory] = useState<string>("file-categories")
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  const items = getVehicleAuditsByCategory(activeCategory as VehicleAuditCategory)

  const filtered = items.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      let cellValue = ""
      if (key === "id") cellValue = item.id.toString()
      else if (key === "event") {
        if (value !== "all" && item.event.toLowerCase() !== value.toLowerCase()) return false
        continue
      }
      else if (key === "createdBy") cellValue = item.createdBy
      if (cellValue && !cellValue.toLowerCase().includes(value.toLowerCase())) return false
    }
    return true
  })

  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key)
    setExpandedRow(null)
    setFilters({})
    setPage(0)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export vehicle audits as ${format}`)
  }

  return (
    <div className="space-y-6">
      {/* Category Sub-Tabs */}
      <CategorySubTabs
        tabs={auditCategories}
        activeTab={activeCategory}
        onTabChange={handleCategoryChange}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="gap-1.5 text-primary" onClick={() => { setFilters({}); setPage(0) }}>
            <RefreshCw className="size-3.5" />
            Reset Grid
          </Button>
          <span className="text-gray-300">|</span>
          <p className="text-sm text-gray-500">
            Drag a column header here to group by that column
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              {["ID", "Event", "Created By", "Created At"].map((col) => (
                <label key={col} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm">{col}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className="min-w-160">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-20 font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Event</TableHead>
              <TableHead className="font-semibold text-gray-700">Created By</TableHead>
              <TableHead className="font-semibold text-gray-700">Created At</TableHead>
            </TableRow>
            {/* Filter row */}
            <TableRow>
              <TableHead className="py-1">
                <div className="relative max-w-16">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input placeholder="" className="pl-6 h-6 text-xs border-gray-200" onChange={(e) => handleFilterChange("id", e.target.value)} />
                </div>
              </TableHead>
              <TableHead className="py-1">
                <Select defaultValue="all" onValueChange={(v) => handleFilterChange("event", v)}>
                  <SelectTrigger className="h-6 text-xs border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Create">Create</SelectItem>
                    <SelectItem value="Update">Update</SelectItem>
                    <SelectItem value="Delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="py-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input placeholder="" className="pl-6 h-6 text-xs border-gray-200" onChange={(e) => handleFilterChange("createdBy", e.target.value)} />
                </div>
              </TableHead>
              <TableHead className="py-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  No Data
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((entry, index) => (
                <>
                  <TableRow
                    key={entry.id}
                    className={`cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"} ${expandedRow === entry.id ? "bg-blue-50" : ""}`}
                    onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                  >
                    <TableCell className="text-sm text-gray-700">{entry.id}</TableCell>
                    <TableCell className="text-sm text-gray-700">{entry.event}</TableCell>
                    <TableCell className="text-sm text-gray-700">{entry.createdBy}</TableCell>
                    <TableCell className="text-sm text-gray-700">{entry.createdAt}</TableCell>
                  </TableRow>
                  {expandedRow === entry.id && (
                    <TableRow key={`diff-${entry.id}`}>
                      <TableCell colSpan={4} className="p-0">
                        <AuditDiffPanel before={entry.before} after={entry.after} />
                      </TableCell>
                    </TableRow>
                  )}
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
