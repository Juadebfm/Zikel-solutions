import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface YoungPersonRecord {
  id: string
  firstName: string
  lastName: string
  /** Per spec §M12 — preferred/used name. */
  preferredName?: string | null
  /** Phonetic guidance for staff. */
  namePronunciation?: string | null
  dateOfBirth: string
  homeId?: string
  homeName?: string
  status: string
  /** Per spec §M12 — primary type, e.g. `placement` / `respite`. */
  type?: string
  /** @deprecated alias of `type`; some older list responses used this name. */
  youngPersonType?: string
  gender?: string
  ethnicity?: string | null
  religion?: string | null
  referenceNo?: string | null
  niNumber?: string | null
  roomNumber?: string | null
  category?: string
  avatar?: string
  avatarUrl?: string | null
  admissionDate?: string
  placementEndDate?: string | null
  keyWorkerId?: string | null
  keyWorker?: string | { id: string; name: string } | null
  practiceManagerId?: string | null
  adminUserId?: string | null
  socialWorkerName?: string | null
  independentReviewingOfficer?: string | null
  placingAuthority?: string | null
  legalStatus?: string | null
  isEmergencyPlacement?: boolean
  isAsylumSeeker?: boolean
  contact?: Record<string, unknown> | null
  health?: Record<string, unknown> | null
  education?: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface YoungPersonListResult {
  items: YoungPersonRecord[]
  meta: ApiMeta
}

export interface CreateYoungPersonInput {
  /** Required per spec §M12 — server returns 422 without it. */
  homeId: string
  firstName: string
  lastName: string
  /** Must be YYYY-MM-DD format */
  dateOfBirth?: string
  preferredName?: string
  type?: string
  /** @deprecated use `type` */
  youngPersonType?: string
  gender?: string
  category?: string
  admissionDate?: string
  keyWorkerId?: string
  keyWorker?: string
}

export interface UpdateYoungPersonInput {
  firstName?: string
  lastName?: string
  preferredName?: string
  /** Must be YYYY-MM-DD format */
  dateOfBirth?: string
  homeId?: string
  type?: string
  /** @deprecated use `type` */
  youngPersonType?: string
  gender?: string
  category?: string
  admissionDate?: string
  keyWorkerId?: string
  keyWorker?: string
}

export interface YoungPersonListParams {
  page?: number
  pageSize?: number
  search?: string
  homeId?: string
  status?: string
  gender?: string
  type?: string
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
