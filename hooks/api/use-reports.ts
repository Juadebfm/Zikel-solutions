import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  reportsService,
  type EvidencePackParams,
  type RiDashboardParams,
  type RiDrilldownParams,
} from "@/services/reports.service"

// ─── Reg 44/45 Evidence Packs ───────────────────────────────────

export function useReg44Pack(params?: EvidencePackParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.reg44Pack({ ...params, format: "json" }),
    queryFn: () => reportsService.getReg44Pack({ ...params, format: "json" }),
    enabled,
  })
}

export function useReg45Pack(params?: EvidencePackParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.reg45Pack({ ...params, format: "json" }),
    queryFn: () => reportsService.getReg45Pack({ ...params, format: "json" }),
    enabled,
  })
}

// ─── RI Dashboard ───────────────────────────────────────────────

export function useRiDashboard(params?: RiDashboardParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.riDashboard({ ...params }),
    queryFn: () => reportsService.getRiDashboard(params),
    enabled,
  })
}

export function useRiDrilldown(params: RiDrilldownParams, enabled = true) {
  const resolvedParams = {
    metric: params.metric,
    homeId: params.homeId,
    careGroupId: params.careGroupId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.reports.riDrilldown(resolvedParams),
    queryFn: () => reportsService.getRiDrilldown(resolvedParams),
    enabled: enabled && Boolean(params.metric),
    placeholderData: keepPreviousData,
  })
}
