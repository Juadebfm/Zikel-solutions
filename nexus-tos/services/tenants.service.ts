import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"
import type { TenantRole } from "@/types"

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
  }

  return fallback
}

function pickNullableString(record: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string") {
      return value
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

  const fromInvites = asRecordArray(record.invites)
  if (fromInvites.length > 0) {
    return fromInvites
  }

  return asRecordArray(record.data)
}

function normalizeTenantRole(value: unknown): TenantRole {
  if (value === "tenant_admin" || value === "sub_admin" || value === "staff") {
    return value
  }

  return "staff"
}

function normalizeInviteStatus(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "pending"
  }

  return value.toLowerCase()
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

export interface TenantInvite {
  id: string
  email: string
  role: TenantRole
  status: string
  token: string | null
  inviteLink: string | null
  invitedBy: string | null
  expiresAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface TenantInvitesResult {
  items: TenantInvite[]
  meta: ApiMeta
}

export interface CreateTenantInviteInput {
  email: string
  role: TenantRole
}

export interface CreateTenantInviteResult {
  message: string
  invite: TenantInvite | null
  token: string | null
  inviteLink: string | null
}

export interface TenantInviteActionResult {
  message: string
  tenantId: string | null
}

function mapInvite(record: JsonRecord): TenantInvite {
  return {
    id: pickString(record, ["id", "inviteId", "_id"]),
    email: pickString(record, ["email"]),
    role: normalizeTenantRole(record.role ?? record.tenantRole),
    status: normalizeInviteStatus(record.status),
    token: pickNullableString(record, ["token", "inviteToken"]),
    inviteLink: pickNullableString(record, ["inviteLink", "link", "url"]),
    invitedBy: pickNullableString(record, ["invitedBy", "invitedByEmail", "createdBy"]),
    expiresAt: pickNullableString(record, ["expiresAt"]),
    createdAt: pickNullableString(record, ["createdAt"]),
    updatedAt: pickNullableString(record, ["updatedAt"]),
  }
}

function extractInvite(value: unknown): TenantInvite | null {
  const record = asRecord(value)
  if (!record) {
    return null
  }

  if (record.id || record.inviteId || record._id) {
    return mapInvite(record)
  }

  const nestedInvite = asRecord(record.invite)
  if (nestedInvite) {
    return mapInvite(nestedInvite)
  }

  return null
}

export const tenantsService = {
  async listInvites(
    tenantId: string,
    params?: {
      status?: string
      page?: number
      limit?: number
    }
  ): Promise<TenantInvitesResult> {
    const response = await apiRequest<unknown, ApiMeta>({
      path: `/tenants/${tenantId}/invites`,
      auth: true,
      query: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })

    const rows = normalizeListData(response.data)
    const items = rows.map(mapInvite).filter((invite) => Boolean(invite.id))

    return {
      items,
      meta: normalizeMeta(response.meta, items.length),
    }
  },

  async createInvite(
    tenantId: string,
    input: CreateTenantInviteInput
  ): Promise<CreateTenantInviteResult> {
    const response = await apiRequest<unknown>({
      path: `/tenants/${tenantId}/invites`,
      method: "POST",
      auth: true,
      body: input,
    })

    const dataRecord = asRecord(response.data)
    const invite = extractInvite(response.data)
    const token =
      invite?.token ??
      (dataRecord ? pickNullableString(dataRecord, ["token", "inviteToken"]) : null)
    const inviteLink =
      invite?.inviteLink ??
      (dataRecord ? pickNullableString(dataRecord, ["inviteLink", "link", "url"]) : null)
    const message = dataRecord ? pickString(dataRecord, ["message"], "Invite created successfully.") : "Invite created successfully."

    return {
      message,
      invite,
      token,
      inviteLink,
    }
  },

  async revokeInvite(
    tenantId: string,
    inviteId: string
  ): Promise<TenantInviteActionResult> {
    const response = await apiRequest<unknown>({
      path: `/tenants/${tenantId}/invites/${inviteId}/revoke`,
      method: "PATCH",
      auth: true,
    })

    const dataRecord = asRecord(response.data)
    return {
      message: dataRecord ? pickString(dataRecord, ["message"], "Invite revoked.") : "Invite revoked.",
      tenantId: dataRecord ? pickNullableString(dataRecord, ["tenantId"]) : null,
    }
  },

  async acceptInvite(token: string): Promise<TenantInviteActionResult> {
    const response = await apiRequest<unknown>({
      path: "/tenants/invites/accept",
      method: "POST",
      auth: true,
      body: { token },
    })

    const dataRecord = asRecord(response.data)
    const tenantIdFromMembership = asRecord(dataRecord?.membership)?.tenantId
    const tenantId =
      (typeof dataRecord?.tenantId === "string" && dataRecord.tenantId) ||
      (typeof tenantIdFromMembership === "string" && tenantIdFromMembership) ||
      null

    return {
      message: dataRecord ? pickString(dataRecord, ["message"], "Invite accepted.") : "Invite accepted.",
      tenantId,
    }
  },
}

export default tenantsService
