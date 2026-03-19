"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Table2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  widgetTypeLabels,
  periodOptions,
  reportsOnOptions,
  type WidgetType,
} from "@/data/widget-options"
import { useCreateDashboardWidget } from "@/hooks/api/use-dashboard"
import { getApiErrorMessage } from "@/lib/api/error"

const widgetTypeIcons: Record<string, React.ElementType> = {
  "data-card": CreditCard,
  "pie-chart": PieChart,
  "bar-chart": BarChart3,
  "line-chart": LineChart,
  "table": Table2,
}

function ConfigureWidgetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const widgetType = (searchParams.get("type") || "data-card") as WidgetType

  const [title, setTitle] = useState("")
  const [period, setPeriod] = useState("")
  const [reportsOn, setReportsOn] = useState("")
  const [error, setError] = useState<string | null>(null)
  const createWidgetMutation = useCreateDashboardWidget()

  const Icon = widgetTypeIcons[widgetType] || BarChart3
  const typeName = widgetTypeLabels[widgetType] || "Widget"

  const handleSave = async () => {
    setError(null)

    try {
      await createWidgetMutation.mutateAsync({
        title: title.trim(),
        period: period as "last_7_days" | "last_30_days" | "this_month" | "this_year" | "all_time",
        reportsOn: reportsOn as "tasks" | "approvals" | "young_people" | "employees",
      })

      router.push("/my-dashboard")
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to save widget. Please try again."))
    }
  }

  const isValid = title.trim() && period && reportsOn

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configure Widget</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up your {typeName.toLowerCase()} widget.
        </p>
      </div>

      {/* Back button */}
      <div>
        <Link href="/my-dashboard/widgets">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="size-3.5" />
            Back to Widget Selection
          </Button>
        </Link>
      </div>

      {/* Widget type indicator */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{typeName}</p>
              <p className="text-xs text-gray-500">Selected widget type</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
        <CardTitle className="text-base">Widget Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {/* Card Title */}
          <div className="space-y-2">
            <Label htmlFor="widget-title">Card Title</Label>
            <Input
              id="widget-title"
              placeholder="Enter widget title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="widget-period">Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent position="popper">
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reports On */}
          <div className="space-y-2">
            <Label htmlFor="widget-reports-on">Reports On</Label>
            <Select value={reportsOn} onValueChange={setReportsOn}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select what to report on" />
              </SelectTrigger>
              <SelectContent position="popper">
                {reportsOnOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <Link href="/my-dashboard">
          <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={!isValid || createWidgetMutation.isPending} className="gap-2 w-full sm:w-auto">
          <Save className="size-3.5" />
          {createWidgetMutation.isPending ? "Saving..." : "Save Widget"}
        </Button>
      </div>
    </div>
  )
}

export default function ConfigureWidgetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
      <ConfigureWidgetForm />
    </Suspense>
  )
}
