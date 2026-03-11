import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  dashboardService,
  type CreateDashboardWidgetInput,
} from "@/services/dashboard.service"

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.getStats(),
  })
}

export function useDashboardWidgets() {
  return useQuery({
    queryKey: queryKeys.dashboard.widgets,
    queryFn: () => dashboardService.getWidgets(),
  })
}

export function useCreateDashboardWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDashboardWidgetInput) => dashboardService.createWidget(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.widgets })
    },
  })
}

export function useDeleteDashboardWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dashboardService.deleteWidget(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.widgets })
    },
  })
}
