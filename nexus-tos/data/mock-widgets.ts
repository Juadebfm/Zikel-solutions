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
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
]

export const reportsOnOptions = [
  { value: "tasks", label: "Tasks" },
  { value: "care-plans", label: "Care Plans" },
  { value: "incidents", label: "Incidents" },
  { value: "medications", label: "Medications" },
  { value: "staff-hours", label: "Staff Hours" },
  { value: "young-people", label: "Young People" },
  { value: "shifts", label: "Shifts" },
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
