import { apiRequest } from "@/lib/api/client"
import { API_CONFIG } from "@/lib/api/config"
import type { ApiMeta } from "@/lib/api/types"
import { getAuthSessionState } from "@/stores/auth-session-store"

/**
 * Hybrid response pattern (confirmed by BE 2026-05-12):
 * - `format=json` → standard envelope, parse via `apiRequest`
 * - `format=pdf|excel|zip` → binary stream with `Content-Type` + `Content-Disposition`,
 *   parse via `fetch().blob()` and trigger a download
 *
 * `downloadBinaryReport()` below handles the binary path correctly: prepends
 * `API_CONFIG.baseUrl` so cross-origin deploys resolve, and forwards the
 * access token from the auth session so private reports are accessible.
 */
async function downloadBinaryReport(path: string, query: Record<string, string | number | undefined>): Promise<Blob> {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue
    search.set(k, String(v))
  }
  const baseUrl = API_CONFIG.baseUrl.endsWith("/")
    ? API_CONFIG.baseUrl.slice(0, -1)
    : API_CONFIG.baseUrl
  const url = `${baseUrl}${path}?${search.toString()}`

  const accessToken = getAuthSessionState().accessToken
  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch(url, {
    credentials: "include",
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to download report: ${response.statusText}`)
  }

  return response.blob()
}

// ─── Reg 44/45 Evidence Packs ───────────────────────────────────

export type EvidencePackFormat = "json" | "pdf" | "excel" | "zip"

export interface EvidencePackParams {
  /**
   * Tenant id is required by the BE per spec §M29. Pass `session.activeTenantId`
   * from the auth context at the call site. Wire-level remaps `dateFrom` →
   * `startDate` and `dateTo` → `endDate` so callers can keep the FE-native field
   * names while the request stays spec-compliant.
   */
  tenantId: string
  homeId?: string
  dateFrom?: string
  dateTo?: string
  maxEvidenceItems?: number
  format?: EvidencePackFormat
}

function buildEvidencePackQuery(params: EvidencePackParams) {
  return {
    tenantId: params.tenantId,
    startDate: params.dateFrom,
    endDate: params.dateTo,
    homeId: params.homeId,
    maxEvidenceItems: params.maxEvidenceItems,
    format: params.format ?? "json",
  }
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
  /** Required per spec §M29. */
  tenantId: string
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
  /** Required per spec §M29. */
  tenantId: string
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

// ─── Service ────────────────────────────────────────────────────

export const reportsService = {
  // ── Reg 44 ──────────────────────────────────────────────────

  async getReg44Pack(params: EvidencePackParams): Promise<EvidencePackResult> {
    const response = await apiRequest<EvidencePackResult>({
      path: "/reports/reg44-pack",
      auth: true,
      query: buildEvidencePackQuery(params),
    })

    return response.data
  },

  async downloadReg44Pack(params: EvidencePackParams): Promise<Blob> {
    return downloadBinaryReport(
      "/reports/reg44-pack",
      buildEvidencePackQuery({ ...params, format: params.format ?? "pdf" }),
    )
  },

  // ── Reg 45 ──────────────────────────────────────────────────

  async getReg45Pack(params: EvidencePackParams): Promise<EvidencePackResult> {
    const response = await apiRequest<EvidencePackResult>({
      path: "/reports/reg45-pack",
      auth: true,
      query: buildEvidencePackQuery(params),
    })

    return response.data
  },

  async downloadReg45Pack(params: EvidencePackParams): Promise<Blob> {
    return downloadBinaryReport(
      "/reports/reg45-pack",
      buildEvidencePackQuery({ ...params, format: params.format ?? "pdf" }),
    )
  },

  // ── RI Dashboard ────────────────────────────────────────────

  async getRiDashboard(params: RiDashboardParams): Promise<RiDashboardResult> {
    const response = await apiRequest<RiDashboardResult>({
      path: "/reports/ri-dashboard",
      auth: true,
      query: {
        tenantId: params.tenantId,
        homeId: params.homeId,
        careGroupId: params.careGroupId,
        startDate: params.dateFrom,
        endDate: params.dateTo,
        format: params.format ?? "json",
      },
    })

    return response.data
  },

  async downloadRiDashboard(params: RiDashboardParams): Promise<Blob> {
    return downloadBinaryReport("/reports/ri-dashboard", {
      tenantId: params.tenantId,
      homeId: params.homeId,
      careGroupId: params.careGroupId,
      startDate: params.dateFrom,
      endDate: params.dateTo,
      format: params.format ?? "pdf",
    })
  },

  async getRiDrilldown(params: RiDrilldownParams): Promise<RiDrilldownResult> {
    const response = await apiRequest<RiDrilldownResult>({
      path: "/reports/ri-dashboard/drilldown",
      auth: true,
      query: {
        tenantId: params.tenantId,
        metric: params.metric,
        homeId: params.homeId,
        careGroupId: params.careGroupId,
        startDate: params.dateFrom,
        endDate: params.dateTo,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        format: params.format ?? "json",
      },
    })

    return response.data
  },

  async downloadRiDrilldown(params: RiDrilldownParams): Promise<Blob> {
    return downloadBinaryReport("/reports/ri-dashboard/drilldown", {
      tenantId: params.tenantId,
      metric: params.metric,
      homeId: params.homeId,
      careGroupId: params.careGroupId,
      startDate: params.dateFrom,
      endDate: params.dateTo,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      format: params.format ?? "pdf",
    })
  },
}
