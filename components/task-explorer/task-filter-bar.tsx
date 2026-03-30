"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "sent_for_approval", label: "Sent for Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "home", label: "Home" },
  { value: "young_person", label: "Young Person" },
  { value: "vehicle", label: "Vehicle" },
  { value: "employee", label: "Employee" },
  { value: "document", label: "Document" },
  { value: "event", label: "Event" },
]

const PERIOD_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
]

interface TaskFilterBarProps {
  search: string
  status: string
  type: string
  category: string
  period: string
  showFilters: boolean
  categories: Array<{ value: string; label: string }> | undefined
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onPeriodChange: (value: string) => void
  onToggleFilters: () => void
  onReset: () => void
}

export function TaskFilterBar({
  search,
  status,
  type,
  category,
  period,
  showFilters,
  categories,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onCategoryChange,
  onPeriodChange,
  onToggleFilters,
  onReset,
}: TaskFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [localSearch, search, onSearchChange])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (type) count++
    if (category) count++
    if (period) count++
    return count
  }, [type, category, period])

  const hasAnyFilter = !!(search || status || type || category || period)

  const categoryOptions = useMemo(
    () => [{ value: "", label: "All" }, ...(categories ?? [])],
    [categories]
  )

  return (
    <div className="space-y-3">
      {/* Always visible row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search tasks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={status || "all"}
          onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="default"
          onClick={onToggleFilters}
          className="gap-1.5"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1 size-5 p-0">
              {activeFilterCount}
            </Badge>
          )}
          {showFilters ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </Button>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            aria-label="Reset all filters"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Collapsible filters row */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={type || "all"}
            onValueChange={(val) => onTypeChange(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category || "all"}
            onValueChange={(val) => onCategoryChange(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem
                  key={opt.value || "all"}
                  value={opt.value || "all"}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={period || "all"}
            onValueChange={(val) => onPeriodChange(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value || "all"}
                  value={opt.value || "all"}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
