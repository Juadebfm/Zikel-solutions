import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ───────────────────────────────────────────────────────

export interface DailyLogRelatesTo {
  type: "young_person" | "vehicle"
  id: string
}

export interface DailyLogListItem {
  id: string
  title: string
  description?: string
  category: string
  status: string
  priority: string
  dueDate: string | null
  homeId: string | null
  youngPersonId: string | null
  vehicleId: string | null
  formTemplateKey: string | null
  submissionPayload?: {
    dailyLogCategory?: string
    noteDate?: string
    relatesTo?: DailyLogRelatesTo | null
  }
  createdAt: string
  updatedAt?: string
}

export interface DailyLogDetail extends DailyLogListItem {
  attachments: unknown[]
  approvalChain: unknown[]
  activityLog: unknown[]
  comments: unknown[]
  formData?: Record<string, unknown> | null
}

export interface CreateDailyLogPayload {
  homeId: string
  noteDate: string
  category: string
  note: string
  relatesTo?: DailyLogRelatesTo | null
  triggerTaskFormKey?: string | null
}

export interface UpdateDailyLogPayload {
  homeId?: string
  noteDate?: string
  category?: string
  note?: string
  relatesTo?: DailyLogRelatesTo | null
  triggerTaskFormKey?: string | null
}

export interface DailyLogListParams {
  page?: number
  pageSize?: number
  homeId?: string
  youngPersonId?: string
  vehicleId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: "createdAt" | "dueAt" | "title"
  sortOrder?: "asc" | "desc"
}

export interface PaginatedDailyLogs {
  items: DailyLogListItem[]
  meta: ApiMeta
}

// ─── Service ─────────────────────────────────────────────────────

export const dailyLogsService = {
  async list(params?: DailyLogListParams): Promise<PaginatedDailyLogs> {
    const response = await apiRequest<DailyLogListItem[], ApiMeta>({
      path: "/daily-logs",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        homeId: params?.homeId,
        youngPersonId: params?.youngPersonId,
        vehicleId: params?.vehicleId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? { total: 0, page: 1, pageSize: 20, totalPages: 0 },
    }
  },

  async getDetail(id: string): Promise<DailyLogDetail> {
    const response = await apiRequest<DailyLogDetail>({
      path: `/daily-logs/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(payload: CreateDailyLogPayload): Promise<DailyLogListItem> {
    const response = await apiRequest<DailyLogListItem>({
      path: "/daily-logs",
      method: "POST",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async update(id: string, payload: UpdateDailyLogPayload): Promise<DailyLogListItem> {
    const response = await apiRequest<DailyLogListItem>({
      path: `/daily-logs/${id}`,
      method: "PATCH",
      auth: true,
      body: payload,
    })
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/daily-logs/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}
