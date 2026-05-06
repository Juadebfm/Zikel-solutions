import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Region Types ───────────────────────────────────────────────

export interface Region {
  id: string
  name: string
  description?: string | null
  homeIds: string[]
  homeNames?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RegionListParams {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export interface CreateRegionPayload {
  name: string
  description?: string
  homeIds: string[]
}

// ─── Grouping Types ─────────────────────────────────────────────

export type GroupingType = "operational" | "reporting" | "custom"
export type GroupingEntityType = "home" | "employee" | "care_group"

export interface Grouping {
  id: string
  name: string
  description?: string | null
  type: GroupingType
  entityType: GroupingEntityType
  entityIds: string[]
  entityNames?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GroupingListParams {
  page?: number
  pageSize?: number
  search?: string
  type?: GroupingType
  isActive?: boolean
}

export interface CreateGroupingPayload {
  name: string
  description?: string
  type: GroupingType
  entityIds: string[]
  entityType: GroupingEntityType
}

// ─── Paginated ──────────────────────────────────────────────────

export interface PaginatedRegions {
  items: Region[]
  meta: ApiMeta
}

export interface PaginatedGroupings {
  items: Grouping[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

const normalizeRegion = (region: Region): Region => ({
  ...region,
  homeIds: Array.isArray(region.homeIds) ? region.homeIds : [],
  homeNames: Array.isArray(region.homeNames) ? region.homeNames : undefined,
})

const normalizeGrouping = (grouping: Grouping): Grouping => ({
  ...grouping,
  entityIds: Array.isArray(grouping.entityIds) ? grouping.entityIds : [],
  entityNames: Array.isArray(grouping.entityNames) ? grouping.entityNames : undefined,
})

// ─── Service ────────────────────────────────────────────────────

export const organisationService = {
  // ── Regions ─────────────────────────────────────────────────

  async listRegions(params?: RegionListParams): Promise<PaginatedRegions> {
    const response = await apiRequest<Region[], ApiMeta>({
      path: "/regions",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        isActive: params?.isActive,
      },
    })

    return {
      items: response.data.map(normalizeRegion),
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getRegion(id: string): Promise<Region> {
    const response = await apiRequest<Region>({
      path: `/regions/${id}`,
      auth: true,
    })
    return normalizeRegion(response.data)
  },

  async createRegion(payload: CreateRegionPayload): Promise<Region> {
    const response = await apiRequest<Region>({
      path: "/regions",
      auth: true,
      method: "POST",
      body: payload,
    })
    return normalizeRegion(response.data)
  },

  async updateRegion(id: string, payload: Partial<CreateRegionPayload>): Promise<Region> {
    const response = await apiRequest<Region>({
      path: `/regions/${id}`,
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return normalizeRegion(response.data)
  },

  async deleteRegion(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/regions/${id}`,
      auth: true,
      method: "DELETE",
    })
  },

  // ── Groupings ───────────────────────────────────────────────

  async listGroupings(params?: GroupingListParams): Promise<PaginatedGroupings> {
    const response = await apiRequest<Grouping[], ApiMeta>({
      path: "/groupings",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        type: params?.type,
        isActive: params?.isActive,
      },
    })

    return {
      items: response.data.map(normalizeGrouping),
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getGrouping(id: string): Promise<Grouping> {
    const response = await apiRequest<Grouping>({
      path: `/groupings/${id}`,
      auth: true,
    })
    return normalizeGrouping(response.data)
  },

  async createGrouping(payload: CreateGroupingPayload): Promise<Grouping> {
    const response = await apiRequest<Grouping>({
      path: "/groupings",
      auth: true,
      method: "POST",
      body: payload,
    })
    return normalizeGrouping(response.data)
  },

  async updateGrouping(id: string, payload: Partial<CreateGroupingPayload>): Promise<Grouping> {
    const response = await apiRequest<Grouping>({
      path: `/groupings/${id}`,
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return normalizeGrouping(response.data)
  },

  async deleteGrouping(id: string): Promise<void> {
    await apiRequest<unknown>({
      path: `/groupings/${id}`,
      auth: true,
      method: "DELETE",
    })
  },
}
