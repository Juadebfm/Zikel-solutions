"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  CreditCard,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { widgetTypeLabels, type Widget } from "@/data/mock-widgets"

const widgetTypeIcons: Record<string, React.ElementType> = {
  "data-card": CreditCard,
  "pie-chart": PieChart,
  "bar-chart": BarChart3,
  "line-chart": LineChart,
  "table": Table2,
}

const WIDGETS_STORAGE_KEY = "dashboard-widgets"

function loadWidgets(): Widget[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(WIDGETS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveWidgets(widgets: Widget[]) {
  localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets))
}

export default function MyDashboardPage() {
  const [widgets, setWidgets] = useState<Widget[]>([])

  useEffect(() => {
    setWidgets(loadWidgets())
  }, [])

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export dashboard as ${format}`)
  }

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== id)
      saveWidgets(updated)
      return updated
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Stats Grid — 10 cards */}
      <StatsOverview />

      {/* Widgets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
              const Icon = widgetTypeIcons[widget.type] || BarChart3
              return (
                <Card key={widget.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm sm:text-base font-semibold">
                        {widget.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{widget.period.replace("-", " ")}</span>
                      <span>·</span>
                      <span className="capitalize">{widget.reportsOn.replace("-", " ")}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {widget.type === "data-card" ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {widget.data.value}
                          </p>
                          <p className="text-xs text-gray-500">
                            {widgetTypeLabels[widget.type]}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 sm:h-48 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 px-3">
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                        <p className="text-xs text-gray-400">
                          {widgetTypeLabels[widget.type]} visualization
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1 justify-center">
                          {Object.entries(widget.data).map(([key, val]) => (
                            <span
                              key={key}
                              className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5"
                            >
                              {key.replace("-", " ")}: <strong>{val}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
