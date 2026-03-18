import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface CareGroupRecord {
  id: string
  name: string
  type: "private" | "public" | "charity"
  phoneNumber?: string
  email?: string
  faxNumber?: string
  description?: string
  website?: string
  defaultUserIpRestriction: boolean
  homes: string[]
  manager: string
  contact?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  countryRegion?: string
  postcode?: string
  twilioSid?: string
  twilioToken?: string
  twilioPhoneNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CareGroupListResult {
  items: CareGroupRecord[]
  meta: ApiMeta
}

export interface CreateCareGroupInput {
  name: string
  type: "private" | "public" | "charity"
  phoneNumber?: string
  email?: string
  faxNumber?: string
  description?: string
  website?: string
  defaultUserIpRestriction?: boolean
  contact?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  countryRegion?: string
  postcode?: string
}

export interface UpdateCareGroupInput {
  name?: string
  type?: "private" | "public" | "charity"
  phoneNumber?: string
  email?: string
  faxNumber?: string
  description?: string
  website?: string
  defaultUserIpRestriction?: boolean
  contact?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  countryRegion?: string
  postcode?: string
}

export interface CareGroupListParams {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

export const careGroupsService = {
  async list(params?: CareGroupListParams): Promise<CareGroupListResult> {
    const response = await apiRequest<CareGroupRecord[], ApiMeta>({
      path: "/care-groups",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        isActive: params?.isActive ?? true,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getById(id: string): Promise<CareGroupRecord> {
    const response = await apiRequest<CareGroupRecord>({
      path: `/care-groups/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(input: CreateCareGroupInput): Promise<CareGroupRecord> {
    const response = await apiRequest<CareGroupRecord>({
      path: "/care-groups",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async update(id: string, input: UpdateCareGroupInput): Promise<CareGroupRecord> {
    const response = await apiRequest<CareGroupRecord>({
      path: `/care-groups/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest({
      path: `/care-groups/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}

export default careGroupsService
