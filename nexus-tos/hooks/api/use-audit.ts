import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  auditService,
  type AuditEventsQueryParams,
  type SecurityAlertsQueryParams,
} from "@/services/audit.service"

export function useAuditEvents(params?: AuditEventsQueryParams, enabled = true) {
  const resolvedParams = {
    search: params?.search,
    action: params?.action,
    actorId: params?.actorId,
    tenantId: params?.tenantId,
    from: params?.from,
    to: params?.to,
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.audit.events(resolvedParams),
    queryFn: () => auditService.getAuditEvents(resolvedParams),
    enabled,
  })
}

export function useSecurityAlerts(params?: SecurityAlertsQueryParams, enabled = true) {
  const resolvedParams = {
    search: params?.search,
    severity: params?.severity,
    status: params?.status,
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.audit.securityAlerts(resolvedParams),
    queryFn: () => auditService.getSecurityAlerts(resolvedParams),
    enabled,
  })
}

export function useAuditEventDetail(id: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.audit.detail(id ?? "none"),
    queryFn: () => auditService.getAuditEventById(id!),
    enabled: Boolean(id) && enabled,
  })
}
