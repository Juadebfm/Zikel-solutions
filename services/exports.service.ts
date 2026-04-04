import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ──────────────────────────────────────────────────────

export type ExportEntity =
  | "homes"
  | "employees"
  | "young_people"
  | "vehicles"
  | "care_groups"
  | "tasks"
  | "daily_logs"
  | "audit"

export type ExportFormat = "pdf" | "excel" | "csv"

export type ExportStatus = "pending" | "processing" | "completed" | "failed"

export interface ExportJob {
  id: string
  entity: ExportEntity
  format: ExportFormat
  status: ExportStatus
  filters?: Record<string, unknown> | null
  createdAt: string
  completedAt?: string | null
  errorMessage?: string | null
  fileName?: string | null
}

export interface CreateExportPayload {
  entity: ExportEntity
  filters?: Record<string, unknown>
  format: ExportFormat
}

export interface ExportListParams {
  page?: number
  pageSize?: number
  status?: ExportStatus
}

export interface PaginatedExports {
  items: ExportJob[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const exportsService = {
  async create(payload: CreateExportPayload): Promise<ExportJob> {
    const response = await apiRequest<ExportJob>({
      path: "/exports",
      auth: true,
      method: "POST",
      body: payload,
    })
    return response.data
  },

  async list(params?: ExportListParams): Promise<PaginatedExports> {
    const response = await apiRequest<ExportJob[], ApiMeta>({
      path: "/exports",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        status: params?.status,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getDetail(id: string): Promise<ExportJob> {
    const response = await apiRequest<ExportJob>({
      path: `/exports/${id}`,
      auth: true,
    })
    return response.data
  },

  async download(id: string): Promise<Blob> {
    const response = await fetch(`/api/v1/exports/${id}/download`, {
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to download export: ${response.statusText}`)
    }

    return response.blob()
  },
}
