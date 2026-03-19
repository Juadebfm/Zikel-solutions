"use client"

import { Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelectDropdown } from "@/components/task-explorer/multi-select-dropdown"
import {
  taskExplorerPeriodOptions,
  taskExplorerTypeOptions,
  taskExplorerProjectOptions,
  taskExplorerFormOptions,
  taskExplorerFieldOptions,
  taskExplorerSearchByOtherOptions,
  taskExplorerStatusOptions,
} from "@/lib/constants"
import type { TaskExplorerFilters } from "@/types"

interface TaskExplorerConfigProps {
  filters: TaskExplorerFilters
  onFiltersChange: <K extends keyof TaskExplorerFilters>(key: K, value: TaskExplorerFilters[K]) => void
}

export function TaskExplorerConfig({
  filters,
  onFiltersChange: updateFilter,
}: TaskExplorerConfigProps) {

  return (
    <div className="space-y-6 p-6">
      {/* Period — full width, required */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          <span className="text-orange-500">* </span>Period
        </Label>
        <Select
          value={filters.period}
          onValueChange={(val) => updateFilter("period", val as TaskExplorerFilters["period"])}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {taskExplorerPeriodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Types + Projects — 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Types</Label>
          <Select
            value={filters.type}
            onValueChange={(val) => updateFilter("type", val as TaskExplorerFilters["type"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {taskExplorerTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Projects</Label>
          <Select
            value={filters.project}
            onValueChange={(val) => updateFilter("project", val)}
          >
            <SelectTrigger className="w-full border-dashed">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-gray-400" />
                <SelectValue placeholder="All" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {taskExplorerProjectOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Select A Form + Select Field — 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Select A Form
          </Label>
          <MultiSelectDropdown
            options={taskExplorerFormOptions}
            selected={filters.forms}
            onChange={(val) => updateFilter("forms", val)}
            placeholder="All Forms"
            searchable
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Select Field
          </Label>
          <div className="relative">
            <Select
              value={filters.field}
              onValueChange={(val) => updateFilter("field", val)}
            >
              <SelectTrigger className="w-full border-dashed">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                  <SelectValue placeholder="Select..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {taskExplorerFieldOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Search By Keyword + Search By Other — 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Search By Keyword
          </Label>
          <Input
            placeholder="Enter Keyword"
            value={filters.keyword}
            onChange={(e) => updateFilter("keyword", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Search By Other
          </Label>
          <MultiSelectDropdown
            options={taskExplorerSearchByOtherOptions}
            selected={filters.searchByOther}
            onChange={(val) => updateFilter("searchByOther", val)}
            placeholder="Select..."
          />
        </div>
      </div>

      {/* Search By Task ID — full width */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Search By Task ID
        </Label>
        <Input
          placeholder="Enter Task ID"
          value={filters.taskId}
          onChange={(e) => updateFilter("taskId", e.target.value)}
        />
      </div>

      {/* Status Options — full width, multi-select with checkboxes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Select Status Options
        </Label>
        <MultiSelectDropdown
          options={taskExplorerStatusOptions}
          selected={filters.statuses}
          onChange={(val) => updateFilter("statuses", val as TaskExplorerFilters["statuses"])}
          placeholder="Select..."
        />
      </div>

      {/* Second select placeholder (matches screenshot) */}
      <div>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder">—</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show Task Audit Trail */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          <span className="text-orange-500">* </span>Show Task Audit Trail
        </Label>
        <div>
          <Switch
            checked={filters.showAuditTrail}
            onCheckedChange={(checked) => updateFilter("showAuditTrail", checked)}
          />
        </div>
      </div>
    </div>
  )
}
