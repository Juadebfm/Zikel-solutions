import { apiRequest } from "@/lib/api/client"
import type { SummaryStats } from "@/services/summary.service"

export type DashboardWidgetPeriod =
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "this_year"
  | "all_time"

export type DashboardWidgetReportsOn =
  | "tasks"
  | "approvals"
  | "young_people"
  | "employees"

export interface DashboardWidget {
  id: string
  userId: string
  title: string
  period: DashboardWidgetPeriod
  reportsOn: DashboardWidgetReportsOn
  createdAt: string
  updatedAt: string
}

export interface CreateDashboardWidgetInput {
  title: string
  period: DashboardWidgetPeriod
  reportsOn: DashboardWidgetReportsOn
}

export interface GenericMessagePayload {
  message: string
}

export const dashboardService = {
  async getStats(): Promise<SummaryStats> {
    const response = await apiRequest<SummaryStats>({
      path: "/dashboard/stats",
      auth: true,
    })

    return response.data
  },

  async getWidgets(): Promise<DashboardWidget[]> {
    const response = await apiRequest<DashboardWidget[]>({
      path: "/dashboard/widgets",
      auth: true,
    })

    return response.data
  },

  async createWidget(input: CreateDashboardWidgetInput): Promise<DashboardWidget> {
    const response = await apiRequest<DashboardWidget>({
      path: "/dashboard/widgets",
      method: "POST",
      auth: true,
      body: input,
    })

    return response.data
  },

  async deleteWidget(id: string): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: `/dashboard/widgets/${id}`,
      method: "DELETE",
      auth: true,
    })

    return response.data
  },
}

export default dashboardService
