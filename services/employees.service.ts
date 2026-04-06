import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface EmployeeRecord {
  id: string
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  homeId?: string
  homeName?: string
  phone?: string
  jobTitle?: string
  status: string
  startDate?: string | null
  endDate?: string | null
  contractType?: string
  roleId?: string
  roleName?: string
  dbsNumber?: string
  dbsDate?: string | null
  qualifications?: string | null
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id?: string
    firstName?: string
    lastName?: string
    name?: string
    email?: string
    role?: string
  }
}

export interface EmployeeListResult {
  items: EmployeeRecord[]
  meta: ApiMeta
}

export interface CreateEmployeeInput {
  userId?: string
  homeId?: string
  roleId?: string
  jobTitle?: string
  startDate?: string
  contractType?: string
}

export interface CreateEmployeeWithUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  homeId: string
  roleId: string
  jobTitle?: string
  startDate?: string
  contractType?: string
  userType?: "internal" | "external"
}

export interface UpdateEmployeeInput {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  roleId?: string
  homeId?: string
  phone?: string
  jobTitle?: string
  startDate?: string
  contractType?: string
  status?: string
}

export interface EmployeeListParams {
  page?: number
  pageSize?: number
  search?: string
  homeId?: string
  status?: string
  roleId?: string
  isActive?: boolean
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

export const employeesService = {
  async list(params?: EmployeeListParams): Promise<EmployeeListResult> {
    const response = await apiRequest<EmployeeRecord[], ApiMeta>({
      path: "/employees",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        homeId: params?.homeId,
        status: params?.status,
        roleId: params?.roleId,
        isActive: params?.isActive ?? true,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getById(id: string): Promise<EmployeeRecord> {
    const response = await apiRequest<EmployeeRecord>({
      path: `/employees/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(input: CreateEmployeeInput): Promise<EmployeeRecord> {
    const response = await apiRequest<EmployeeRecord>({
      path: "/employees",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async createWithUser(input: CreateEmployeeWithUserInput): Promise<EmployeeRecord> {
    const response = await apiRequest<EmployeeRecord>({
      path: "/employees/create-with-user",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async update(id: string, input: UpdateEmployeeInput): Promise<EmployeeRecord> {
    const response = await apiRequest<EmployeeRecord>({
      path: `/employees/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest({
      path: `/employees/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}

export default employeesService
