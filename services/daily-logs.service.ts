import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ───────────────────────────────────────────────────────

export interface DailyLogRelatesTo {
  type: "young_person" | "vehicle"
  id: string
}

export interface DailyLogListItem {
  id: string
  taskRef: string
  title: string
  description?: string
  category: string
  categoryLabel: string
  status: string
  statusLabel: string
  priority: string
  dueAt: string | null
  submittedAt: string | null
  type?: string
  typeLabel?: string
  formTemplateKey: string | null
  relatedEntity: {
    type: string
    id: string
    name: string
    homeId?: string
    careGroupId?: string
  } | null
  assignee: { id: string; name: string; avatarUrl?: string } | null
  createdBy: { id: string; name: string; avatarUrl?: string } | null
  timestamps: {
    createdAt: string
    updatedAt: string
  }
}

export interface DailyLogDetail extends Omit<DailyLogListItem, "description"> {
  homeId: string | null
  youngPersonId: string | null
  vehicleId: string | null
  description: string | null
  submissionPayload?: {
    dailyLogCategory?: string
    noteDate?: string
    relatesTo?: DailyLogRelatesTo | null
  }
  attachments?: unknown[]
  approvalChain?: unknown[]
  activityLog?: unknown[]
  comments?: unknown[]
  formData?: Record<string, unknown> | null
}

export interface CreateDailyLogPayload {
  homeId: string
  noteDate: string
  category: string
  note: string
  relatesTo?: DailyLogRelatesTo | null
  triggerTaskFormKey?: string | null
  reflectivePrompts?: Array<{ promptId: string; response: string }>
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
