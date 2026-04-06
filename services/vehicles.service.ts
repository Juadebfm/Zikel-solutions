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
  description?: string | null
  vin?: string | null
  status?: string | null
  fuelType?: string | null
  ownership?: string | null
  mileage?: number | null
  adminUserId?: string | null
  adminUser?: { id: string; name: string } | null
  contactPhone?: string | null
  registrationDate?: string | null
  taxDate?: string | null
  insuranceDate?: string | null
  motDue?: string | null
  nextServiceDue?: string | null
  startDate?: string | null
  endDate?: string | null
  leaseStartDate?: string | null
  leaseEndDate?: string | null
  purchasePrice?: number | null
  purchaseDate?: string | null
  avatarUrl?: string | null
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
  homeId?: string | null
  make?: string
  model?: string
  year?: number
  colour?: string
  description?: string
  vin?: string
  status?: string
  fuelType?: string
  ownership?: string
  mileage?: number
  adminUserId?: string | null
  contactPhone?: string
  registrationDate?: string
  taxDate?: string
  insuranceDate?: string
  motDue?: string
  nextServiceDue?: string
  startDate?: string
  endDate?: string | null
  leaseStartDate?: string | null
  leaseEndDate?: string | null
  purchasePrice?: number | null
  purchaseDate?: string | null
  details?: Record<string, unknown>
  isActive?: boolean
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
