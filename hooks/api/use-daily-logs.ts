import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  dailyLogsService,
  type CreateDailyLogPayload,
  type UpdateDailyLogPayload,
  type DailyLogListParams,
} from "@/services/daily-logs.service"

export function useDailyLogList(params?: DailyLogListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    homeId: params?.homeId,
    youngPersonId: params?.youngPersonId,
    vehicleId: params?.vehicleId,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  }

  return useQuery({
    queryKey: queryKeys.dailyLogs.list(resolvedParams),
    queryFn: () => dailyLogsService.list(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useDailyLogDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.dailyLogs.detail(id),
    queryFn: () => dailyLogsService.getDetail(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDailyLogPayload) => dailyLogsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "list"] })
    },
  })
}

export function useUpdateDailyLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDailyLogPayload }) =>
      dailyLogsService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["daily-logs", "list"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs.detail(variables.id) }),
      ])
    },
  })
}

export function useDeleteDailyLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dailyLogsService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["daily-logs", "list"] })
    },
  })
}
