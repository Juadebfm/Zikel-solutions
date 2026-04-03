import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Reg 44/45 Evidence Packs ───────────────────────────────────

export type EvidencePackFormat = "json" | "pdf" | "excel" | "zip"

export interface EvidencePackParams {
  homeId?: string
  dateFrom?: string
  dateTo?: string
  maxEvidenceItems?: number
  format?: EvidencePackFormat
}

export interface EvidencePackItem {
  id: string
  type: string
  title: string
  date: string
  source?: string | null
  summary?: string | null
  metadata?: Record<string, unknown> | null
}

export interface EvidencePackResult {
  title: string
  homeId?: string
  homeName?: string
  dateFrom?: string
  dateTo?: string
  generatedAt: string
  items: EvidencePackItem[]
  summary?: Record<string, unknown> | null
}

// ─── RI Dashboard ───────────────────────────────────────────────

export type RiMetric =
  | "compliance"
  | "safeguarding_risk"
  | "staffing_pressure"
  | "action_completion"

export interface RiDashboardParams {
  homeId?: string
  careGroupId?: string
  dateFrom?: string
  dateTo?: string
  format?: "json" | "pdf" | "excel"
}

export interface RiMetricSummary {
  metric: RiMetric
  label: string
  value: number
  target?: number | null
  trend?: "up" | "down" | "stable" | null
  status: "good" | "warning" | "critical"
  description?: string | null
}

export interface RiDashboardResult {
  homeId?: string
  homeName?: string
  careGroupId?: string
  careGroupName?: string
  dateFrom?: string
  dateTo?: string
  generatedAt: string
  metrics: RiMetricSummary[]
}

export interface RiDrilldownParams {
  metric: RiMetric
  homeId?: string
  careGroupId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  format?: "json" | "pdf" | "excel"
}

export interface RiDrilldownItem {
  id: string
  label: string
  value: string
  date?: string | null
  status?: string | null
  metadata?: Record<string, unknown> | null
}

export interface RiDrilldownResult {
  metric: RiMetric
  metricLabel: string
  items: RiDrilldownItem[]
  meta: ApiMeta
}

// ─── Default meta ───────────────────────────────────────────────

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const reportsService = {
  // ── Reg 44 ──────────────────────────────────────────────────

  async getReg44Pack(params?: EvidencePackParams): Promise<EvidencePackResult> {
    const response = await apiRequest<EvidencePackResult>({
      path: "/reports/reg44-pack",
      auth: true,
      query: {
        homeId: params?.homeId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        maxEvidenceItems: params?.maxEvidenceItems,
        format: params?.format ?? "json",
      },
    })

    return response.data
  },

  async downloadReg44Pack(params?: EvidencePackParams): Promise<Blob> {
    const format = params?.format ?? "pdf"
    const response = await fetch(
      `/api/v1/reports/reg44-pack?${new URLSearchParams({
        ...(params?.homeId ? { homeId: params.homeId } : {}),
        ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
        ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
        ...(params?.maxEvidenceItems ? { maxEvidenceItems: String(params.maxEvidenceItems) } : {}),
        format,
      }).toString()}`,
      { credentials: "include" }
    )

    if (!response.ok) {
      throw new Error(`Failed to download Reg 44 pack: ${response.statusText}`)
    }

    return response.blob()
  },

  // ── Reg 45 ──────────────────────────────────────────────────

  async getReg45Pack(params?: EvidencePackParams): Promise<EvidencePackResult> {
    const response = await apiRequest<EvidencePackResult>({
      path: "/reports/reg45-pack",
      auth: true,
      query: {
        homeId: params?.homeId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        maxEvidenceItems: params?.maxEvidenceItems,
        format: params?.format ?? "json",
      },
    })

    return response.data
  },

  async downloadReg45Pack(params?: EvidencePackParams): Promise<Blob> {
    const format = params?.format ?? "pdf"
    const response = await fetch(
      `/api/v1/reports/reg45-pack?${new URLSearchParams({
        ...(params?.homeId ? { homeId: params.homeId } : {}),
        ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
        ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
        ...(params?.maxEvidenceItems ? { maxEvidenceItems: String(params.maxEvidenceItems) } : {}),
        format,
      }).toString()}`,
      { credentials: "include" }
    )

    if (!response.ok) {
      throw new Error(`Failed to download Reg 45 pack: ${response.statusText}`)
    }

    return response.blob()
  },

  // ── RI Dashboard ────────────────────────────────────────────

  async getRiDashboard(params?: RiDashboardParams): Promise<RiDashboardResult> {
    const response = await apiRequest<RiDashboardResult>({
      path: "/reports/ri-dashboard",
      auth: true,
      query: {
        homeId: params?.homeId,
        careGroupId: params?.careGroupId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        format: params?.format ?? "json",
      },
    })

    return response.data
  },

  async getRiDrilldown(params: RiDrilldownParams): Promise<RiDrilldownResult> {
    const response = await apiRequest<RiDrilldownResult>({
      path: "/reports/ri-dashboard/drilldown",
      auth: true,
      query: {
        metric: params.metric,
        homeId: params?.homeId,
        careGroupId: params?.careGroupId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        format: params?.format ?? "json",
      },
    })

    return response.data
  },
}
