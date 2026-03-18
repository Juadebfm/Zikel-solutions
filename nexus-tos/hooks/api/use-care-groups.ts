import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  careGroupsService,
  type CareGroupListParams,
  type CreateCareGroupInput,
  type UpdateCareGroupInput,
} from "@/services/care-groups.service"

export function useCareGroupList(params?: CareGroupListParams) {
  const resolved = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    isActive: params?.isActive ?? true,
  }

  return useQuery({
    queryKey: queryKeys.careGroups.list(resolved),
    queryFn: () => careGroupsService.list(resolved),
  })
}

export function useCareGroupById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.careGroups.detail(id ?? ""),
    queryFn: () => careGroupsService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateCareGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCareGroupInput) => careGroupsService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["care-groups"] })
    },
  })
}

export function useUpdateCareGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCareGroupInput }) =>
      careGroupsService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["care-groups"] })
    },
  })
}

export function useDeleteCareGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => careGroupsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["care-groups"] })
    },
  })
}
