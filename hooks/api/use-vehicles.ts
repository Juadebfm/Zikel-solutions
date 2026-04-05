import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  vehiclesService,
  type VehicleListParams,
  type CreateVehicleInput,
  type UpdateVehicleInput,
} from "@/services/vehicles.service"

export function useVehicleList(params?: VehicleListParams) {
  const resolved = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    homeId: params?.homeId,
    status: params?.status,
    fuelType: params?.fuelType,
    isActive: params?.isActive ?? true,
  }

  return useQuery({
    queryKey: queryKeys.vehicles.list(resolved),
    queryFn: () => vehiclesService.list(resolved),
  })
}

export function useVehicleById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id ?? ""),
    queryFn: () => vehiclesService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateVehicleInput) => vehiclesService.create(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["backend", "vehicles"] }),
      ])
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVehicleInput }) =>
      vehiclesService.update(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["backend", "vehicles"] }),
      ])
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vehiclesService.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["backend", "vehicles"] }),
      ])
    },
  })
}
