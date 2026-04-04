import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  sensitiveDataService,
  type SensitiveRecordListParams,
  type CreateSensitiveRecordPayload,
} from "@/services/sensitive-data.service"

export function useSensitiveDataList(params?: SensitiveRecordListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    category: params?.category,
    youngPersonId: params?.youngPersonId,
    homeId: params?.homeId,
    confidentialityScope: params?.confidentialityScope,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  }

  return useQuery({
    queryKey: queryKeys.sensitiveData.list(resolvedParams),
    queryFn: () => sensitiveDataService.list(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useSensitiveDataDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sensitiveData.detail(id),
    queryFn: () => sensitiveDataService.getDetail(id),
    enabled: enabled && Boolean(id),
  })
}

export function useSensitiveDataCategories() {
  return useQuery({
    queryKey: queryKeys.sensitiveData.categories,
    queryFn: () => sensitiveDataService.getCategories(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateSensitiveRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSensitiveRecordPayload) => sensitiveDataService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sensitive-data", "list"] })
    },
  })
}

export function useUpdateSensitiveRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSensitiveRecordPayload> }) =>
      sensitiveDataService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sensitive-data", "list"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.sensitiveData.detail(variables.id) }),
      ])
    },
  })
}

export function useDeleteSensitiveRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sensitiveDataService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sensitive-data", "list"] })
    },
  })
}

export function useSensitiveDataAccessLog(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sensitiveData.accessLog(id),
    queryFn: () => sensitiveDataService.getAccessLog(id),
    enabled: enabled && Boolean(id),
  })
}
