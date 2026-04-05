import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export interface VehicleRecord {
  id: string
  registration: string
  homeId?: string | null
  homeName?: string | null
  make?: string | null
  model?: string | null
  name?: string | null
  year?: number | null
  colour?: string | null
  status?: string | null
  fuelType?: string | null
  ownership?: string | null
  motDue?: string | null
  nextServiceDue?: string | null
  insuranceDate?: string | null
  registrationDate?: string | null
  mileage?: number | null
  details?: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface VehicleListResult {
  items: VehicleRecord[]
  meta: ApiMeta
}

export interface VehicleListParams {
  page?: number
  pageSize?: number
  search?: string
  homeId?: string
  status?: string
  fuelType?: string
  isActive?: boolean
}

export interface CreateVehicleInput {
  registration: string
  homeId?: string
  make?: string
  model?: string
  year?: number
  colour?: string
  status?: string
  fuelType?: string
  ownership?: string
  motDue?: string
  nextServiceDue?: string
  insuranceDate?: string
  registrationDate?: string
  details?: Record<string, unknown>
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

export const vehiclesService = {
  async list(params?: VehicleListParams): Promise<VehicleListResult> {
    const response = await apiRequest<VehicleRecord[], ApiMeta>({
      path: "/vehicles",
      auth: true,
      query: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
        homeId: params?.homeId,
        status: params?.status,
        fuelType: params?.fuelType,
        isActive: params?.isActive ?? true,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getById(id: string): Promise<VehicleRecord> {
    const response = await apiRequest<VehicleRecord>({
      path: `/vehicles/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(input: CreateVehicleInput): Promise<VehicleRecord> {
    const response = await apiRequest<VehicleRecord>({
      path: "/vehicles",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async update(id: string, input: UpdateVehicleInput): Promise<VehicleRecord> {
    const response = await apiRequest<VehicleRecord>({
      path: `/vehicles/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiRequest({
      path: `/vehicles/${id}`,
      method: "DELETE",
      auth: true,
    })
  },
}

export default vehiclesService
