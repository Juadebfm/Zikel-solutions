import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface Role {
  id: string
  name: string
  description?: string | null
  isActive?: boolean
}

export interface RoleListParams {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

export interface PaginatedRoles {
  items: Role[]
  meta: ApiMeta
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 100,
  totalPages: 0,
}

export const rolesService = {
  async list(params?: RoleListParams): Promise<PaginatedRoles> {
    const response = await apiRequest<Role[], ApiMeta>({
      path: "/roles",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 100,
        search: params?.search,
        isActive: params?.isActive,
      },
    })

    return {
      items: Array.isArray(response.data) ? response.data : [],
      meta: response.meta ?? DEFAULT_META,
    }
  },
}
