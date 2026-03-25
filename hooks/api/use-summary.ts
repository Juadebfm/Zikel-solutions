import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  summaryService,
  type BatchProcessPayload,
  type ReviewEventPayload,
} from "@/services/summary.service"

export function useSummaryStats() {
  return useQuery({
    queryKey: queryKeys.summary.stats,
    queryFn: () => summaryService.getStats(),
  })
}

export function useSummaryTodos(params?: {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
}) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    search: params?.search,
  }

  return useQuery({
    queryKey: queryKeys.summary.todos(resolvedParams),
    queryFn: () => summaryService.getTodos(resolvedParams),
  })
}

export function useSummaryTasksToApprove(params?: { page?: number; pageSize?: number }, enabled = true) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.summary.tasksToApprove(resolvedParams),
    queryFn: () => summaryService.getTasksToApprove(resolvedParams),
    enabled,
  })
}

export function useSummaryTaskToApproveDetail(taskId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.summary.taskToApproveDetail(taskId),
    queryFn: () => summaryService.getTaskToApproveDetail(taskId),
    enabled: enabled && Boolean(taskId),
  })
}

export function useSummaryOverdueTasks(params?: {
  page?: number
  pageSize?: number
  search?: string
  formGroup?: string
}) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    formGroup: params?.formGroup,
  }

  return useQuery({
    queryKey: queryKeys.summary.overdueTasks(resolvedParams),
    queryFn: () => summaryService.getOverdueTasks(resolvedParams),
  })
}

export function useSummaryProvisions() {
  return useQuery({
    queryKey: queryKeys.summary.provisions,
    queryFn: () => summaryService.getProvisions(),
  })
}

export function useProcessSummaryBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchProcessPayload) => summaryService.processBatch(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary", "tasks-to-approve"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.summary.stats }),
      ])
    },
  })
}

export function useApproveSummaryTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, comment }: { taskId: string; comment?: string }) =>
      summaryService.approveTask(taskId, comment),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary", "tasks-to-approve"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.summary.stats }),
      ])
    },
  })
}

export function useRecordSummaryTaskReviewEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: ReviewEventPayload }) =>
      summaryService.recordTaskReviewEvent(taskId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary", "tasks-to-approve"] }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.summary.taskToApproveDetail(variables.taskId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.summary.stats }),
      ])
    },
  })
}
