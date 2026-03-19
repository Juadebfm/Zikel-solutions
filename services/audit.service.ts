import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as JsonRecord
}

function asRecordArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(asRecord)
    .filter((item): item is JsonRecord => Boolean(item))
}

function pickString(record: JsonRecord, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) {
      return value
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value)
    }
  }

  return fallback
}

function pickNullableString(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === "string") {
      return value
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value)
    }

    if (value === null) {
      return null
    }
  }

  return null
}

function normalizeListData(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return asRecordArray(value)
  }

  const record = asRecord(value)
  if (!record) {
    return []
  }

  const fromItems = asRecordArray(record.items)
  if (fromItems.length > 0) {
    return fromItems
  }

  const fromEvents = asRecordArray(record.events)
  if (fromEvents.length > 0) {
    return fromEvents
  }

  const fromAlerts = asRecordArray(record.alerts)
  if (fromAlerts.length > 0) {
    return fromAlerts
  }

  return asRecordArray(record.data)
}

function normalizeMeta(meta: ApiMeta | undefined, fallbackCount: number): ApiMeta {
  if (meta) {
    return meta
  }

  return {
    total: fallbackCount,
    page: 1,
    pageSize: fallbackCount,
    totalPages: fallbackCount > 0 ? 1 : 0,
  }
}

function normalizeSeverity(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "medium"
  }

  return value.toLowerCase()
}

function normalizeStatus(value: unknown, fallback = "open"): string {
  if (typeof value !== "string" || !value.trim()) {
    return fallback
  }

  return value.toLowerCase()
}

function normalizeDetails(record: JsonRecord): JsonRecord | null {
  const details =
    asRecord(record.details) ??
    asRecord(record.metadata) ??
    asRecord(record.payload) ??
    asRecord(record.context) ??
    null

  return details
}

export interface AuditEvent {
  id: string
  action: string
  actor: string
  actorId: string | null
  tenantId: string | null
  resourceType: string | null
  resourceId: string | null
  status: string
  ipAddress: string | null
  message: string | null
  createdAt: string | null
  details: JsonRecord | null
}

export interface SecurityAlert {
  id: string
  title: string
  severity: string
  status: string
  type: string | null
  message: string | null
  tenantId: string | null
  actor: string | null
  createdAt: string | null
  details: JsonRecord | null
}

export interface AuditEventsQueryParams {
  search?: string
  action?: string
  actorId?: string
  tenantId?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface SecurityAlertsQueryParams {
  search?: string
  severity?: string
  status?: string
  page?: number
  limit?: number
}

export interface AuditListResult<T> {
  items: T[]
  meta: ApiMeta
}

function mapAuditEvent(record: JsonRecord, index: number): AuditEvent {
  const action = pickString(record, ["action", "event", "eventType", "type"], "unknown")

  return {
    id: pickString(record, ["id", "auditId", "eventId", "_id"], `audit-event-${index}`),
    action: action.toLowerCase(),
    actor: pickString(
      record,
      ["actor", "actorName", "createdBy", "userName", "userEmail", "triggeredBy"],
      "system"
    ),
    actorId: pickNullableString(record, ["actorId", "userId", "createdById"]),
    tenantId: pickNullableString(record, ["tenantId"]),
    resourceType: pickNullableString(record, ["resourceType", "entityType", "resource", "module"]),
    resourceId: pickNullableString(record, ["resourceId", "entityId", "targetId"]),
    status: normalizeStatus(record.status, "logged"),
    ipAddress: pickNullableString(record, ["ipAddress", "ip"]),
    message: pickNullableString(record, ["message", "summary", "description"]),
    createdAt: pickNullableString(record, ["createdAt", "occurredAt", "timestamp", "generatedAt"]),
    details: normalizeDetails(record),
  }
}

function mapSecurityAlert(record: JsonRecord, index: number): SecurityAlert {
  return {
    id: pickString(record, ["id", "alertId", "_id"], `security-alert-${index}`),
    title: pickString(record, ["title", "alertTitle", "name"], "Security alert"),
    severity: normalizeSeverity(record.severity ?? record.level ?? record.priority),
    status: normalizeStatus(record.status ?? record.state, "open"),
    type: pickNullableString(record, ["type", "alertType", "category"]),
    message: pickNullableString(record, ["message", "summary", "description"]),
    tenantId: pickNullableString(record, ["tenantId"]),
    actor: pickNullableString(record, ["actor", "actorName", "createdBy", "userEmail"]),
    createdAt: pickNullableString(record, ["createdAt", "occurredAt", "timestamp", "generatedAt"]),
    details: normalizeDetails(record),
  }
}

function extractAuditEvent(value: unknown): AuditEvent | null {
  const record = asRecord(value)
  if (!record) {
    return null
  }

  if (record.id || record.auditId || record.eventId || record._id) {
    return mapAuditEvent(record, 0)
  }

  const nestedEvent =
    asRecord(record.event) ??
    asRecord(record.auditEvent) ??
    asRecord(record.item) ??
    asRecord(record.data)

  if (nestedEvent) {
    return mapAuditEvent(nestedEvent, 0)
  }

  return null
}

export const auditService = {
  async getAuditEvents(params?: AuditEventsQueryParams): Promise<AuditListResult<AuditEvent>> {
    const response = await apiRequest<unknown, ApiMeta>({
      path: "/audit",
      auth: true,
      query: {
        search: params?.search,
        action: params?.action,
        actorId: params?.actorId,
        tenantId: params?.tenantId,
        from: params?.from,
        to: params?.to,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })

    const rows = normalizeListData(response.data)
    const items = rows.map(mapAuditEvent).filter((item) => Boolean(item.id))

    return {
      items,
      meta: normalizeMeta(response.meta, items.length),
    }
  },

  async getSecurityAlerts(
    params?: SecurityAlertsQueryParams
  ): Promise<AuditListResult<SecurityAlert>> {
    const response = await apiRequest<unknown, ApiMeta>({
      path: "/audit/security-alerts",
      auth: true,
      query: {
        search: params?.search,
        severity: params?.severity,
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })

    const rows = normalizeListData(response.data)
    const items = rows.map(mapSecurityAlert).filter((item) => Boolean(item.id))

    return {
      items,
      meta: normalizeMeta(response.meta, items.length),
    }
  },

  async getAuditEventById(id: string): Promise<AuditEvent | null> {
    const response = await apiRequest<unknown>({
      path: `/audit/${id}`,
      auth: true,
    })

    return extractAuditEvent(response.data)
  },
}

export default auditService
