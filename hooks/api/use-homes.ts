import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  homesService,
  type HomeListParams,
  type CreateHomeInput,
  type UpdateHomeInput,
} from "@/services/homes.service"

export function useHomeList(params?: HomeListParams) {
  const resolved = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    careGroupId: params?.careGroupId,
    isActive: params?.isActive ?? true,
  }

  return useQuery({
    queryKey: queryKeys.homes.list(resolved),
    queryFn: () => homesService.list(resolved),
  })
}

export function useHomeById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.homes.detail(id ?? ""),
    queryFn: () => homesService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateHome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateHomeInput) => homesService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["homes"] })
    },
  })
}

export function useUpdateHome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHomeInput }) =>
      homesService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["homes"] })
    },
  })
}

export function useDeleteHome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => homesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["homes"] })
    },
  })
}
