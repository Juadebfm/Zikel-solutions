import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  employeesService,
  type EmployeeListParams,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "@/services/employees.service"

export function useEmployeeList(params?: EmployeeListParams) {
  const resolved = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    homeId: params?.homeId,
    isActive: params?.isActive ?? true,
  }

  return useQuery({
    queryKey: queryKeys.employees.list(resolved),
    queryFn: () => employeesService.list(resolved),
  })
}

export function useEmployeeById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id ?? ""),
    queryFn: () => employeesService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      employeesService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })
}
