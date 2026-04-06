"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Plus,
  BarChart3,
  PieChart,
  Table2,
  X,
  ClipboardCheck,
  Users,
  Briefcase,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatsOverview, defaultStats, type StatItem } from "@/components/dashboard/stats-overview"
import { useDashboardStats, useDashboardWidgets, useDeleteDashboardWidget } from "@/hooks/api/use-dashboard"
import { useErrorModalStore } from "@/components/shared/error-modal"
import type { DashboardWidgetReportsOn } from "@/services/dashboard.service"

const reportsOnIconMap: Record<DashboardWidgetReportsOn, React.ElementType> = {
  tasks: Table2,
  approvals: ClipboardCheck,
  young_people: Users,
  employees: Briefcase,
}

const reportsOnLabelMap: Record<DashboardWidgetReportsOn, string> = {
  tasks: "Tasks",
  approvals: "Approvals",
  young_people: "Young People",
  employees: "Employees",
}

const periodLabelMap: Record<string, string> = {
  last_7_days: "Last 7 Days",
  last_30_days: "Last 30 Days",
  this_month: "This Month",
  this_year: "This Year",
  all_time: "All Time",
}

export default function MyDashboardPage() {
  const statsQuery = useDashboardStats()
  const widgetsQuery = useDashboardWidgets()
  const deleteWidgetMutation = useDeleteDashboardWidget()

  const stats = toStatsOverview(statsQuery.data)
  const widgets = widgetsQuery.data ?? []

  const handleExport = (format: "pdf" | "excel") => {
    // Export implementation will be added once export endpoints are registered.
    void format
  }

  const handleRemoveWidget = (id: string) => {
    deleteWidgetMutation.mutate(id)
  }

  const pageError =
    getErrorMessage(statsQuery.error) ||
    getErrorMessage(widgetsQuery.error) ||
    getErrorMessage(deleteWidgetMutation.error)

  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    if (pageError) {
      showError(pageError)
    }
  }, [pageError, showError])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            View your personal performance metrics and activity overview.
          </p>
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

      {(statsQuery.isLoading || widgetsQuery.isLoading) && (
        <div className="p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
          Loading dashboard data...
        </div>
      )}

      <StatsOverview stats={stats} />

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Widgets</h2>
          <Link href="/my-dashboard/widgets">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="size-3.5" />
              Add Widget
            </Button>
          </Link>
        </div>

        {widgets.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                  No widgets added yet. Add a widget to see your data here.
                </p>
                <Link href="/my-dashboard/widgets">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Widget
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {widgets.map((widget) => {
              const Icon = reportsOnIconMap[widget.reportsOn] || PieChart

              return (
                <Card key={widget.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">{widget.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={deleteWidgetMutation.isPending}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{periodLabelMap[widget.period] ?? widget.period}</span>
                      <span>·</span>
                      <span>{reportsOnLabelMap[widget.reportsOn] ?? widget.reportsOn}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-36 sm:h-40 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 px-3">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                      <p className="text-xs text-gray-500 text-center">
                        Widget configured for {reportsOnLabelMap[widget.reportsOn].toLowerCase()} ({periodLabelMap[widget.period] ?? widget.period.toLowerCase()}).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function toStatsOverview(data?: {
  overdue: number
  dueToday: number
  pendingApproval: number
  rejected: number
  draft: number
  future: number
  comments: number
  rewards: number
}): StatItem[] {
  if (!data) {
    return defaultStats
  }

  return defaultStats.map((stat) => {
    switch (stat.label) {
      case "Overdue Tasks":
        return { ...stat, value: data.overdue }
      case "Tasks Due Today":
        return { ...stat, value: data.dueToday }
      case "Pending Approval":
        return { ...stat, value: data.pendingApproval }
      case "Rejected Tasks":
        return { ...stat, value: data.rejected }
      case "Draft Tasks":
        return { ...stat, value: data.draft }
      case "Future Tasks":
        return { ...stat, value: data.future }
      case "Comments":
        return { ...stat, value: data.comments }
      case "Pending Rewards":
        return { ...stat, value: data.rewards }
      default:
        return stat
    }
  })
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  return "Unable to load dashboard data."
}
