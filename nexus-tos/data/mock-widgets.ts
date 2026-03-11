export type WidgetType = "data-card" | "pie-chart" | "bar-chart" | "line-chart" | "table"

export interface Widget {
  id: string
  type: WidgetType
  title: string
  period: string
  reportsOn: string
  data: Record<string, number>
}

export const widgetTypeLabels: Record<WidgetType, string> = {
  "data-card": "Data Card",
  "pie-chart": "Pie Chart",
  "bar-chart": "Bar Chart",
  "line-chart": "Line Chart",
  "table": "Table",
}

export const widgetTypeDescriptions: Record<WidgetType, string> = {
  "data-card": "Display a single metric with a label and value",
  "pie-chart": "Visualize data distribution as a pie chart",
  "bar-chart": "Compare values across categories with bars",
  "line-chart": "Show trends over time with a line graph",
  "table": "Display data in a tabular format with rows and columns",
}

export const periodOptions = [
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
]

export const reportsOnOptions = [
  { value: "tasks", label: "Tasks" },
  { value: "approvals", label: "Approvals" },
  { value: "young_people", label: "Young People" },
  { value: "employees", label: "Employees" },
]

// Pre-saved mock widgets for the dashboard
export const mockWidgets: Widget[] = [
  {
    id: "w1",
    type: "data-card",
    title: "Total Tasks This Month",
    period: "this-month",
    reportsOn: "tasks",
    data: { value: 142 },
  },
  {
    id: "w2",
    type: "pie-chart",
    title: "Task Status Distribution",
    period: "this-month",
    reportsOn: "tasks",
    data: { completed: 85, "in-progress": 32, overdue: 12, draft: 13 },
  },
]
