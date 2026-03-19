import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface HomeRecord {
  id: string
  name: string
  address?: string
  capacity?: number
  currentOccupancy?: number
  manager?: string
  phone?: string
  status: string
  careGroupId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface HomeListResult {
  items: HomeRecord[]
  meta: ApiMeta
}

export interface CreateHomeInput {
  name: string
  address?: string
  capacity?: number
  manager?: string
  phone?: string
  careGroupId?: string
}

export interface UpdateHomeInput {
  name?: string
  address?: string
  capacity?: number
  manager?: string
  phone?: string
  careGroupId?: string
}

export interface HomeListParams {
  page?: number
  pageSize?: number
  search?: string
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
