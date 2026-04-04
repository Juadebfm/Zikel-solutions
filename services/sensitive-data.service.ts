import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ──────────────────────────────────────────────────────

export type ConfidentialityScope = "restricted" | "confidential" | "highly_confidential"

export interface SensitiveRecord {
  id: string
  title: string
  category: string
  content: string
  confidentialityScope: ConfidentialityScope
  youngPersonId?: string | null
  youngPersonName?: string | null
  homeId?: string | null
  homeName?: string | null
  retentionDate?: string | null
  attachmentFileIds?: string[]
  createdBy?: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface SensitiveRecordListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  youngPersonId?: string
  homeId?: string
  confidentialityScope?: ConfidentialityScope
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CreateSensitiveRecordPayload {
  title: string
  category: string
  content: string
  youngPersonId?: string
  homeId?: string
  confidentialityScope: ConfidentialityScope
  retentionDate?: string
  attachmentFileIds?: string[]
}

export interface AccessLogEntry {
  id: string
  userId: string
  userName: string
  action: string
  accessedAt: string
  ipAddress?: string | null
}

export interface PaginatedSensitiveRecords {
  items: SensitiveRecord[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const sensitiveDataService = {
  async list(params?: SensitiveRecordListParams): Promise<PaginatedSensitiveRecords> {
    const response = await apiRequest<SensitiveRecord[], ApiMeta>({
      path: "/sensitive-data",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        category: params?.category,
        youngPersonId: params?.youngPersonId,
        homeId: params?.homeId,
        confidentialityScope: params?.confidentialityScope,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getDetail(id: string): Promise<SensitiveRecord> {
    const response = await apiRequest<SensitiveRecord>({
      path: `/sensitive-data/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(payload: CreateSensitiveRecordPayload): Promise<SensitiveRecord> {
    const response = await apiRequest<SensitiveRecord>({
      path: "/sensitive-data",
      auth: true,
      method: "POST",
      body: payload,
    })
    return response.data
  },

  async update(id: string, payload: Partial<CreateSensitiveRecordPayload>): Promise<SensitiveRecord> {
    const response = await apiRequest<SensitiveRecord>({
      path: `/sensitive-data/${id}`,
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/sensitive-data/${id}`,
      auth: true,
      method: "DELETE",
    })
  },

  async getCategories(): Promise<string[]> {
    const response = await apiRequest<string[]>({
      path: "/sensitive-data/categories",
      auth: true,
    })
    return response.data
  },

  async getAccessLog(id: string): Promise<AccessLogEntry[]> {
    const response = await apiRequest<AccessLogEntry[]>({
      path: `/sensitive-data/${id}/access-log`,
      auth: true,
    })
    return response.data
  },
}
