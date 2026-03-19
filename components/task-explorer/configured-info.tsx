"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { TaskExplorerFilters, TaskExplorerPeriod } from "@/types"
import { taskExplorerPeriodOptions } from "@/lib/constants"

interface ConfiguredInfoProps {
  filters: TaskExplorerFilters
}

function getPeriodDateRange(period: TaskExplorerPeriod | ""): { start: Date; end: Date } | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case "today":
      return { start: today, end: today }
    case "yesterday": {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: yesterday }
    }
    case "last-7-days": {
      const start = new Date(today)
      start.setDate(start.getDate() - 7)
      return { start, end: today }
    }
    case "this-week": {
      const start = new Date(today)
      start.setDate(start.getDate() - start.getDay() + 1) // Monday
      return { start, end: today }
    }
    case "this-month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start, end: today }
    }
    case "this-year": {
      const start = new Date(today.getFullYear(), 0, 1)
      return { start, end: today }
    }
    case "last-month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start, end }
    }
    case "all":
      return null
    default:
      return null
  }
}

function formatDate(date: Date): string {
  const day = date.getDate()
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th"
  const month = date.toLocaleDateString("en-GB", { month: "long" })
  const year = date.getFullYear()
  return `${day}${suffix} ${month} ${year}`
}

export function ConfiguredInfo({ filters }: ConfiguredInfoProps) {
  const periodLabel =
    taskExplorerPeriodOptions.find((o) => o.value === filters.period)?.label.toLowerCase() || filters.period

  const range = getPeriodDateRange(filters.period)

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Configured Information
        </h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">Period Selected: </span>
          <span className="text-green-700">
            {periodLabel}
            {range && (
              <> - ({formatDate(range.start)} - {formatDate(range.end)})</>
            )}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
