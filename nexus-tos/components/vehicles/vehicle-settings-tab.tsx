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
  Plus,
  GripVertical,
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
import { CreateCustomInfoFieldDialog } from "@/components/vehicles/create-custom-info-field-dialog"
import { getVehicleSettingsByCategory, getVehicleCustomInfoFields } from "@/lib/mock-data"
import type { VehicleSettingCategory, VehicleCustomInfoField } from "@/types"

const settingCategories: { key: VehicleSettingCategory; label: string }[] = [
  { key: "file-categories", label: "File Categories" },
  { key: "custom-information-groups", label: "Custom Information Groups" },
  { key: "custom-information-fields", label: "Custom Information Fields" },
]

type BaseColumnKey = "id" | "name" | "systemGenerated" | "hidden" | "createdBy" | "createdAt" | "updatedOn" | "updatedBy" | "sortOrder"
type CustomFieldColumnKey = "id" | "name" | "fieldType" | "heading" | "systemGenerated" | "hidden" | "createdBy" | "createdAt" | "updatedOn" | "updatedBy" | "sortOrder"

const baseColumns: { key: BaseColumnKey; label: string; filterable: boolean }[] = [
  { key: "id", label: "ID", filterable: true },
  { key: "name", label: "Name", filterable: true },
  { key: "systemGenerated", label: "System Generated", filterable: false },
  { key: "hidden", label: "Hidden", filterable: false },
  { key: "createdBy", label: "Created By", filterable: true },
  { key: "createdAt", label: "Created At", filterable: false },
  { key: "updatedOn", label: "Updated On", filterable: false },
  { key: "updatedBy", label: "Updated By", filterable: true },
  { key: "sortOrder", label: "Sort Order", filterable: false },
]

const customFieldColumns: { key: CustomFieldColumnKey; label: string; filterable: boolean }[] = [
  { key: "id", label: "ID", filterable: true },
  { key: "name", label: "Name", filterable: true },
  { key: "fieldType", label: "Field Type", filterable: true },
  { key: "heading", label: "Heading", filterable: true },
  { key: "systemGenerated", label: "System Generated", filterable: false },
  { key: "hidden", label: "Hidden", filterable: false },
  { key: "createdBy", label: "Created By", filterable: true },
  { key: "createdAt", label: "Created At", filterable: false },
  { key: "updatedOn", label: "Updated On", filterable: false },
  { key: "updatedBy", label: "Updated By", filterable: true },
  { key: "sortOrder", label: "Sort Order", filterable: false },
]

const fieldTypeLabels: Record<string, string> = {
  "date-input": "Date Input",
  "time-input": "Time Input",
  "true-or-false": "True or False",
  "yes-or-no": "Yes or No",
  "checkbox-list": "CheckBox List",
  "dropdown-select-list": "Dropdown Select List",
  "radio-buttons": "Radio Buttons",
  "numeric-input": "Numeric Input",
  "single-line-text-input": "Single Line Text Input",
  "multi-line-text-input": "Multi Line Text Input",
}

export function VehicleSettingsTab() {
  const [activeCategory, setActiveCategory] = useState<string>("file-categories")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")
  const [showCreateField, setShowCreateField] = useState(false)

  const isCustomFields = activeCategory === "custom-information-fields"
  const columns = isCustomFields ? customFieldColumns : baseColumns

  const settingItems = isCustomFields ? [] : getVehicleSettingsByCategory(activeCategory as VehicleSettingCategory)
  const customFieldItems = isCustomFields ? getVehicleCustomInfoFields() : []

  // Unified filtering
  const filteredSettings = settingItems.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      let cellValue = ""
      if (key === "id") cellValue = item.id.toString()
      else if (key === "name") cellValue = item.name
      else if (key === "createdBy") cellValue = item.createdBy
      else if (key === "updatedBy") cellValue = item.updatedBy
      if (cellValue && !cellValue.toLowerCase().includes(value.toLowerCase())) return false
    }
    return true
  })

  const filteredCustomFields = customFieldItems.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      let cellValue = ""
      if (key === "id") cellValue = item.id.toString()
      else if (key === "name") cellValue = item.name
      else if (key === "fieldType") cellValue = fieldTypeLabels[item.fieldType] || item.fieldType
      else if (key === "heading") cellValue = item.heading
      else if (key === "createdBy") cellValue = item.createdBy
      else if (key === "updatedBy") cellValue = item.updatedBy
      if (cellValue && !cellValue.toLowerCase().includes(value.toLowerCase())) return false
    }
    return true
  })

  const filtered = isCustomFields ? filteredCustomFields : filteredSettings
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key)
    setFilters({})
    setPage(0)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export vehicle settings as ${format}`)
  }

  const handleAdd = () => {
    if (isCustomFields) {
      setShowCreateField(true)
    } else {
      console.log(`Add new ${activeCategory} item`)
    }
  }

  const renderCellValue = (item: VehicleCustomInfoField | typeof settingItems[0], colKey: string) => {
    if (isCustomFields) {
      const field = item as VehicleCustomInfoField
      switch (colKey) {
        case "id": return field.id
        case "name": return field.name
        case "fieldType": return fieldTypeLabels[field.fieldType] || field.fieldType
        case "heading": return field.heading
        case "systemGenerated": return field.systemGenerated ? "Yes" : "No"
        case "hidden": return field.hidden ? "Yes" : "No"
        case "createdBy": return field.createdBy
        case "createdAt": return field.createdAt
        case "updatedOn": return field.updatedOn
        case "updatedBy": return field.updatedBy
        case "sortOrder": return field.sortOrder
        default: return ""
      }
    } else {
      const setting = item as typeof settingItems[0]
      switch (colKey) {
        case "id": return setting.id
        case "name": return setting.name
        case "systemGenerated": return setting.systemGenerated ? "Yes" : "No"
        case "hidden": return setting.hidden ? "Yes" : "No"
        case "createdBy": return setting.createdBy
        case "createdAt": return setting.createdAt
        case "updatedOn": return setting.updatedOn
        case "updatedBy": return setting.updatedBy
        case "sortOrder": return setting.sortOrder
        default: return ""
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Sub-Tabs */}
      <CategorySubTabs
        tabs={settingCategories}
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
          <Button variant="default" size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleAdd}>
            <Plus className="size-3.5" />
            Add
          </Button>

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
              {columns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm">{col.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className={isCustomFields ? "min-w-280" : "min-w-225"}>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((col) => (
                <TableHead key={col.key} className={`font-semibold text-gray-700 ${col.key === "id" ? "w-20" : ""}`}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
            {/* Filter row */}
            <TableRow>
              {columns.map((col) => (
                <TableHead key={`filter-${col.key}`} className="py-1">
                  {col.filterable && (
                    <div className={`relative ${col.key === "id" ? "max-w-16" : ""}`}>
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input
                        placeholder=""
                        className="pl-6 h-6 text-xs border-gray-200"
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
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
                <TableCell colSpan={columns.length} className="text-center py-10 text-gray-400">
                  No Data
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, index) => (
                <TableRow key={(item as { id: number }).id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-sm text-gray-700">
                      {col.key === "sortOrder" ? (
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-3.5 w-3.5 text-gray-400" />
                          {renderCellValue(item, col.key)}
                        </div>
                      ) : (
                        renderCellValue(item, col.key)
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

      {/* Create Custom Information Field Dialog */}
      <CreateCustomInfoFieldDialog
        open={showCreateField}
        onOpenChange={setShowCreateField}
      />
    </div>
  )
}
