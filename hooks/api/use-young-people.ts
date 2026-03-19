import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  youngPeopleService,
  type YoungPersonListParams,
  type CreateYoungPersonInput,
  type UpdateYoungPersonInput,
} from "@/services/young-people.service"

export function useYoungPersonList(params?: YoungPersonListParams) {
  const resolved = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    homeId: params?.homeId,
    isActive: params?.isActive ?? true,
  }

  return useQuery({
    queryKey: queryKeys.youngPeople.list(resolved),
    queryFn: () => youngPeopleService.list(resolved),
  })
}

export function useYoungPersonById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.youngPeople.detail(id ?? ""),
    queryFn: () => youngPeopleService.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateYoungPerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateYoungPersonInput) => youngPeopleService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["young-people"] })
    },
  })
}

export function useUpdateYoungPerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateYoungPersonInput }) =>
      youngPeopleService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["young-people"] })
    },
  })
}

export function useDeleteYoungPerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => youngPeopleService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["young-people"] })
    },
  })
}
