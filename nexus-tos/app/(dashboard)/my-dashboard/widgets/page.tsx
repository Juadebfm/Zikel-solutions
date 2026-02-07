"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Table2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  widgetTypeLabels,
  widgetTypeDescriptions,
  type WidgetType,
} from "@/data/mock-widgets"

const widgetTypes: { type: WidgetType; icon: React.ElementType }[] = [
  { type: "data-card", icon: CreditCard },
  { type: "pie-chart", icon: PieChart },
  { type: "bar-chart", icon: BarChart3 },
  { type: "line-chart", icon: LineChart },
  { type: "table", icon: Table2 },
]

export default function WidgetSelectionPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<WidgetType | null>(null)

  const handleNext = () => {
    if (selected) {
      router.push(`/my-dashboard/widgets/configure?type=${selected}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Widget</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a widget type to add to your dashboard.
        </p>
      </div>

      {/* Back button */}
      <div>
        <Link href="/my-dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Widget Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {widgetTypes.map(({ type, icon: Icon }) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selected === type
                ? "ring-2 ring-primary border-primary"
                : "hover:border-gray-300"
            }`}
            onClick={() => setSelected(type)}
          >
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6">
              <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                <div
                  className={`h-10 w-10 sm:h-14 sm:w-14 rounded-lg flex items-center justify-center ${
                    selected === type
                      ? "bg-primary/10"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 sm:h-7 sm:w-7 ${
                      selected === type ? "text-primary" : "text-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    {widgetTypeLabels[type]}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {widgetTypeDescriptions[type]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next button */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selected}
          className="gap-2"
        >
          Next
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
