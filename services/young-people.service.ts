import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface YoungPersonRecord {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  homeId?: string
  homeName?: string
  status: string
  youngPersonType?: string
  gender?: string
  category?: string
  avatar?: string
  admissionDate?: string
  keyWorker?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface YoungPersonListResult {
  items: YoungPersonRecord[]
  meta: ApiMeta
}

export interface CreateYoungPersonInput {
  firstName: string
  lastName: string
  /** Must be YYYY-MM-DD format */
  dateOfBirth: string
  homeId?: string
  youngPersonType?: string
  gender?: string
  category?: string
  admissionDate?: string
  keyWorker?: string
}

export interface UpdateYoungPersonInput {
  firstName?: string
  lastName?: string
  /** Must be YYYY-MM-DD format */
  dateOfBirth?: string
  homeId?: string
  youngPersonType?: string
  gender?: string
  category?: string
  admissionDate?: string
  keyWorker?: string
}

export interface YoungPersonListParams {
  page?: number
  pageSize?: number
  search?: string
  homeId?: string
  isActive?: boolean
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

export const youngPeopleService = {
  async list(params?: YoungPersonListParams): Promise<YoungPersonListResult> {
    const response = await apiRequest<YoungPersonRecord[], ApiMeta>({
      path: "/young-people",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        homeId: params?.homeId,
        isActive: params?.isActive ?? true,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getById(id: string): Promise<YoungPersonRecord> {
    const response = await apiRequest<YoungPersonRecord>({
      path: `/young-people/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(input: CreateYoungPersonInput): Promise<YoungPersonRecord> {
    const response = await apiRequest<YoungPersonRecord>({
      path: "/young-people",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async update(id: string, input: UpdateYoungPersonInput): Promise<YoungPersonRecord> {
    const response = await apiRequest<YoungPersonRecord>({
      path: `/young-people/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest({
      path: `/young-people/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}

export default youngPeopleService
