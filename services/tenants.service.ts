import { apiRequest } from "@/lib/api/client"
import { isApiClientError } from "@/lib/api/error"
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

function pickBoolean(record: JsonRecord, keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "boolean") {
      return value
    }
  }

  return fallback
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

  const fromInviteLinks = asRecordArray(record.inviteLinks)
  if (fromInviteLinks.length > 0) {
    return fromInviteLinks
  }

  const fromLinks = asRecordArray(record.links)
  if (fromLinks.length > 0) {
    return fromLinks
  }

  const fromMemberships = asRecordArray(record.memberships)
  if (fromMemberships.length > 0) {
    return fromMemberships
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

function normalizeMembershipStatus(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return "active"
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

export interface TenantInviteLink {
  id: string
  tenantId: string | null
  tenantName: string | null
  code: string
  defaultRole: TenantRole
  isActive: boolean
  expiresAt: string | null
  createdAt: string | null
  revokedAt: string | null
}

export interface TenantInviteLinksResult {
  items: TenantInviteLink[]
  meta: ApiMeta
}

export interface CreateTenantInviteLinkInput {
  defaultRole?: Exclude<TenantRole, "tenant_admin">
  expiresInHours?: number
}

export interface CreateTenantInviteLinkResult {
  message: string
  link: TenantInviteLink | null
}

export interface RevokeTenantInviteLinkResult {
  message: string
  inviteLinkId: string | null
}

export interface TenantMembershipRecord {
  id: string
  tenantId: string | null
  userId: string | null
  firstName: string
  lastName: string
  email: string
  role: TenantRole
  status: string
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface TenantMembershipsResult {
  items: TenantMembershipRecord[]
  meta: ApiMeta
}

export interface UpdateTenantMembershipInput {
  status?: string
  role?: TenantRole
}

export interface UpdateTenantMembershipResult {
  message: string
  membership: TenantMembershipRecord | null
}

export interface CreateTenantStaffInput {
  firstName: string
  lastName: string
  email: string
  role: Exclude<TenantRole, "tenant_admin">
}

export interface CreateTenantStaffResult {
  message: string
  userId: string | null
  userEmail: string | null
  membership: TenantMembershipRecord | null
}

export interface CreateSelfServeTenantInput {
  name: string
}

export interface CreateSelfServeTenantResult {
  message: string
  tenantId: string | null
}

function shouldRetrySelfServeWithLegacyBody(error: unknown): boolean {
  if (!isApiClientError(error)) {
    return false
  }

  if (error.status !== 400 && error.status !== 422) {
    return false
  }

  const code = error.code.toUpperCase()
  return (
    code === "FST_ERR_VALIDATION" ||
    code === "VALIDATION_ERROR" ||
    code === "BAD_REQUEST" ||
    code === "REQUEST_FAILED" ||
    code.includes("VALIDATION")
  )
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

function mapInviteLink(record: JsonRecord): TenantInviteLink {
  return {
    id: pickString(record, ["id", "inviteLinkId", "_id"]),
    tenantId: pickNullableString(record, ["tenantId"]),
    tenantName: pickNullableString(record, ["tenantName"]),
    code: pickString(record, ["code"]),
    defaultRole: normalizeTenantRole(record.defaultRole ?? record.role),
    isActive: pickBoolean(record, ["isActive"], true),
    expiresAt: pickNullableString(record, ["expiresAt"]),
    createdAt: pickNullableString(record, ["createdAt"]),
    revokedAt: pickNullableString(record, ["revokedAt"]),
  }
}

function extractInviteLink(value: unknown): TenantInviteLink | null {
  const record = asRecord(value)
  if (!record) {
    return null
  }

  if (record.id || record.inviteLinkId || record._id) {
    return mapInviteLink(record)
  }

  const nestedLink = asRecord(record.link) ?? asRecord(record.inviteLink)
  if (nestedLink) {
    return mapInviteLink(nestedLink)
  }

  return null
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

function mapMembership(record: JsonRecord): TenantMembershipRecord {
  const user = asRecord(record.user)

  const status = normalizeMembershipStatus(record.status)
  const isActive = pickBoolean(record, ["isActive"], status === "active")

  return {
    id: pickString(record, ["id", "membershipId", "_id"]),
    tenantId: pickNullableString(record, ["tenantId"]),
    userId:
      pickNullableString(record, ["userId"]) ||
      (user ? pickNullableString(user, ["id", "userId", "_id"]) : null),
    firstName: pickString(record, ["firstName", "firstname"], user ? pickString(user, ["firstName", "firstname"], "") : ""),
    lastName: pickString(record, ["lastName", "lastname", "surname"], user ? pickString(user, ["lastName", "lastname", "surname"], "") : ""),
    email: pickString(record, ["email"], user ? pickString(user, ["email"], "") : ""),
    role: normalizeTenantRole(record.role ?? record.tenantRole),
    status,
    isActive,
    createdAt: pickNullableString(record, ["createdAt"]),
    updatedAt: pickNullableString(record, ["updatedAt"]),
  }
}

function extractMembership(value: unknown): TenantMembershipRecord | null {
  const record = asRecord(value)
  if (!record) {
    return null
  }

  if (record.id || record.membershipId || record._id) {
    return mapMembership(record)
  }

  const nestedMembership = asRecord(record.membership)
  if (nestedMembership) {
    return mapMembership(nestedMembership)
  }

  return null
}

export const tenantsService = {
  async listMemberships(
    tenantId: string,
    params?: {
      status?: string
      page?: number
      limit?: number
    }
  ): Promise<TenantMembershipsResult> {
    const response = await apiRequest<unknown, ApiMeta>({
      path: `/tenants/${tenantId}/memberships`,
      auth: true,
      query: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })

    const rows = normalizeListData(response.data)
    const items = rows.map(mapMembership).filter((membership) => Boolean(membership.id))

    return {
      items,
      meta: normalizeMeta(response.meta, items.length),
    }
  },

  async updateMembership(
    tenantId: string,
    membershipId: string,
    input: UpdateTenantMembershipInput
  ): Promise<UpdateTenantMembershipResult> {
    const response = await apiRequest<unknown>({
      path: `/tenants/${tenantId}/memberships/${membershipId}`,
      method: "PATCH",
      auth: true,
      body: input,
    })

    const dataRecord = asRecord(response.data)
    return {
      message: dataRecord ? pickString(dataRecord, ["message"], "Membership updated.") : "Membership updated.",
      membership: extractMembership(response.data),
    }
  },

  async createStaff(
    tenantId: string,
    input: CreateTenantStaffInput
  ): Promise<CreateTenantStaffResult> {
    const response = await apiRequest<unknown>({
      path: `/tenants/${tenantId}/staff`,
      method: "POST",
      auth: true,
      body: input,
    })

    const dataRecord = asRecord(response.data)
    const userRecord = asRecord(dataRecord?.user)
    const userId =
      (userRecord ? pickNullableString(userRecord, ["id", "userId", "_id"]) : null) ??
      (dataRecord ? pickNullableString(dataRecord, ["userId"]) : null)
    const userEmail =
      (userRecord ? pickNullableString(userRecord, ["email"]) : null) ??
      (dataRecord ? pickNullableString(dataRecord, ["email"]) : null)

    return {
      message: dataRecord ? pickString(dataRecord, ["message"], "Staff account provisioned.") : "Staff account provisioned.",
      userId,
      userEmail,
      membership: extractMembership(response.data),
    }
  },

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

  async listInviteLinks(
    tenantId: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<TenantInviteLinksResult> {
    const response = await apiRequest<unknown, ApiMeta>({
      path: `/tenants/${tenantId}/invite-links`,
      auth: true,
      query: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })

    const rows = normalizeListData(response.data)
    const items = rows.map(mapInviteLink).filter((link) => Boolean(link.id))

    return {
      items,
      meta: normalizeMeta(response.meta, items.length),
    }
  },

  async createInviteLink(
    tenantId: string,
    input: CreateTenantInviteLinkInput
  ): Promise<CreateTenantInviteLinkResult> {
    const response = await apiRequest<unknown>({
      path: `/tenants/${tenantId}/invite-link`,
      method: "POST",
      auth: true,
      body: input,
    })

    const dataRecord = asRecord(response.data)
    return {
      message: dataRecord ? pickString(dataRecord, ["message"], "Invite link generated.") : "Invite link generated.",
      link: extractInviteLink(response.data),
    }
  },

  async revokeInviteLink(
    tenantId: string,
    linkId: string
  ): Promise<RevokeTenantInviteLinkResult> {
    const response = await apiRequest<unknown>({
      path: `/tenants/${tenantId}/invite-links/${linkId}/revoke`,
      method: "PATCH",
      auth: true,
    })

    const dataRecord = asRecord(response.data)
    const inviteLinkRecord = asRecord(dataRecord?.inviteLink)

    return {
      message: dataRecord ? pickString(dataRecord, ["message"], "Invite link revoked.") : "Invite link revoked.",
      inviteLinkId:
        (inviteLinkRecord ? pickNullableString(inviteLinkRecord, ["id", "inviteLinkId"]) : null) ??
        (dataRecord ? pickNullableString(dataRecord, ["id", "inviteLinkId", "linkId"]) : null),
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

  async createSelfServeTenant(
    input: CreateSelfServeTenantInput
  ): Promise<CreateSelfServeTenantResult> {
    let responseData: unknown

    try {
      const response = await apiRequest<unknown>({
        path: "/tenants/self-serve",
        method: "POST",
        auth: true,
        body: { name: input.name },
      })
      responseData = response.data
    } catch (error) {
      if (!shouldRetrySelfServeWithLegacyBody(error)) {
        throw error
      }

      const legacyResponse = await apiRequest<unknown>({
        path: "/tenants/self-serve",
        method: "POST",
        auth: true,
        body: { tenantName: input.name },
      })
      responseData = legacyResponse.data
    }

    const dataRecord = asRecord(responseData)
    const tenantRecord = asRecord(dataRecord?.tenant)
    const membershipRecord = asRecord(dataRecord?.membership)

    const tenantId =
      pickNullableString(dataRecord ?? {}, ["tenantId", "id"]) ||
      pickNullableString(tenantRecord ?? {}, ["id", "tenantId"]) ||
      pickNullableString(membershipRecord ?? {}, ["tenantId"])

    return {
      message: dataRecord
        ? pickString(dataRecord, ["message"], "Organization created successfully.")
        : "Organization created successfully.",
      tenantId,
    }
  },
}

export default tenantsService
