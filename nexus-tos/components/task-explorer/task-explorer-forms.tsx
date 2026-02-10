"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { ConfiguredInfo } from "@/components/task-explorer/configured-info"
import { mockFormSubmissions } from "@/lib/mock-data"
import type { TaskExplorerFilters } from "@/types"

interface TaskExplorerFormsProps {
  filters: TaskExplorerFilters
}

// Build chart config from mock data
const chartConfig: ChartConfig = Object.fromEntries(
  mockFormSubmissions.map((item) => [
    item.name,
    { label: item.name, color: item.color },
  ])
)

// Calculate total for percentage
const total = mockFormSubmissions.reduce((sum, item) => sum + item.count, 0)

export function TaskExplorerForms({ filters }: TaskExplorerFormsProps) {
  return (
    <div className="space-y-6">
      {/* Configured Information Summary */}
      <ConfiguredInfo filters={filters} />

      {/* Action buttons */}
      <div className="flex justify-end gap-3 px-1">
        <Button className="bg-primary hover:bg-primary/90">
          select all
        </Button>
        <Button variant="outline">
          export graph
        </Button>
      </div>

      {/* Bar Chart */}
      <div className="px-2">
        <ChartContainer config={chartConfig} className="h-100 w-full">
          <BarChart
            data={mockFormSubmissions}
            margin={{ top: 10, right: 20, left: 10, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                const pct = Math.round((data.count / total) * 100)
                return (
                  <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
                    <p className="text-sm font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      {data.count} ({pct}%)
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {mockFormSubmissions.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 pb-4">
        {mockFormSubmissions.map((item) => {
          const pct = Math.round((item.count / total) * 100)
          return (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="inline-block h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />
              {item.name} - {item.count} ({pct}%)
            </div>
          )
        })}
      </div>
    </div>
  )
}
