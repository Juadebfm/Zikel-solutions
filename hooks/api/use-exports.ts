import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  exportsService,
  type CreateExportPayload,
  type ExportListParams,
} from "@/services/exports.service"

export function useExportList(params?: ExportListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    status: params?.status,
  }

  return useQuery({
    queryKey: queryKeys.exports.list(resolvedParams),
    queryFn: () => exportsService.list(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useExportDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.exports.detail(id),
    queryFn: () => exportsService.getDetail(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateExport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExportPayload) => exportsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exports", "list"] })
    },
  })
}
