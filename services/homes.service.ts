import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface HomeRecord {
  id: string
  name: string
  careGroupId?: string
  careGroupName?: string
  description?: string
  address?: string
  postCode?: string
  capacity?: number
  category?: string
  region?: string
  status: string
  phoneNumber?: string
  email?: string
  avatarUrl?: string | null
  admin?: { id: string; name: string } | null
  personInCharge?: { id: string; name: string } | null
  responsibleIndividual?: { id: string; name: string } | null
  startDate?: string | null
  endDate?: string | null
  isSecure?: boolean
  shortTermStays?: boolean
  minAgeGroup?: number | null
  maxAgeGroup?: number | null
  ofstedUrn?: string
  compliance?: unknown
  details?: unknown
  counts?: {
    employees?: number
    youngPeople?: number
    vehicles?: number
    tasks?: number
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Legacy fields for backward compatibility
  manager?: string
  phone?: string
  currentOccupancy?: number
}

export interface HomeListResult {
  items: HomeRecord[]
  meta: ApiMeta
}

export interface CreateHomeInput {
  careGroupId: string
  name: string
  description?: string
  address?: string
  postCode?: string
  capacity?: number
  category?: string
  region?: string
  status?: string
  phoneNumber?: string
  email?: string
  isSecure?: boolean
  shortTermStays?: boolean
  minAgeGroup?: number | null
  maxAgeGroup?: number | null
  ofstedUrn?: string
  startDate?: string | null
  adminUserId?: string | null
  personInChargeId?: string | null
  responsibleIndividualId?: string | null
}

export interface UpdateHomeInput {
  name?: string
  careGroupId?: string
  description?: string
  address?: string
  postCode?: string
  capacity?: number
  category?: string
  region?: string
  status?: string
  phoneNumber?: string
  email?: string
  isSecure?: boolean
  shortTermStays?: boolean
  minAgeGroup?: number | null
  maxAgeGroup?: number | null
  ofstedUrn?: string
  startDate?: string | null
  endDate?: string | null
  adminUserId?: string | null
  personInChargeId?: string | null
  responsibleIndividualId?: string | null
}

export interface HomeListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  careGroupId?: string
  isActive?: boolean
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

export const homesService = {
  async list(params?: HomeListParams): Promise<HomeListResult> {
    const response = await apiRequest<HomeRecord[], ApiMeta>({
      path: "/homes",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        status: params?.status,
        careGroupId: params?.careGroupId,
        isActive: params?.isActive ?? true,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getById(id: string): Promise<HomeRecord> {
    const response = await apiRequest<HomeRecord>({
      path: `/homes/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(input: CreateHomeInput): Promise<HomeRecord> {
    const response = await apiRequest<HomeRecord>({
      path: "/homes",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async update(id: string, input: UpdateHomeInput): Promise<HomeRecord> {
    const response = await apiRequest<HomeRecord>({
      path: `/homes/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest({
      path: `/homes/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}

export default homesService
