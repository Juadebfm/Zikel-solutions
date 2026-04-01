import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  summaryService,
  type BatchArchivePayload,
  type BatchPostponePayload,
  type BatchProcessPayload,
  type BatchReassignPayload,
  type PostponeTaskPayload,
  type ReviewEventPayload,
  type SummaryTaskScope,
} from "@/services/summary.service"

/** Keep summary data cached for 10 min; mutations invalidate on change. */
const SUMMARY_STALE_TIME = 10 * 60 * 1000
/** Keep cached data in memory for 30 min so navigating away and back is instant. */
const SUMMARY_GC_TIME = 30 * 60 * 1000

export function useSummaryStats() {
  return useQuery({
    queryKey: queryKeys.summary.stats,
    queryFn: () => summaryService.getStats(),
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
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
    placeholderData: keepPreviousData,
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
  })
}

export function useSummaryTasksToApprove(
  params?: { page?: number; pageSize?: number; scope?: SummaryTaskScope },
  enabled = true
) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    scope: params?.scope ?? "all",
  }

  return useQuery({
    queryKey: queryKeys.summary.tasksToApprove(resolvedParams),
    queryFn: () => summaryService.getTasksToApprove(resolvedParams),
    placeholderData: keepPreviousData,
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
    enabled,
  })
}

export function useAllSummaryTasksToApprove(enabled = true) {
  const scope: SummaryTaskScope = "all"

  return useQuery({
    queryKey: queryKeys.summary.tasksToApproveAll(scope),
    queryFn: () => summaryService.getAllTasksToApprove(500, scope),
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
    enabled,
  })
}

export function useSummaryTaskToApproveDetail(taskId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.summary.taskToApproveDetail(taskId),
    queryFn: () => summaryService.getTaskToApproveDetail(taskId),
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
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
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
  })
}

export function useSummaryProvisions() {
  return useQuery({
    queryKey: queryKeys.summary.provisions,
    queryFn: () => summaryService.getProvisions(),
    staleTime: SUMMARY_STALE_TIME,
    gcTime: SUMMARY_GC_TIME,
  })
}

export function useProcessSummaryBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchProcessPayload) => summaryService.processBatch(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ])
    },
  })
}

export function useApproveSummaryTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      comment,
      signatureFileId,
      gateScope,
    }: {
      taskId: string
      comment?: string
      signatureFileId?: string
      gateScope?: "global" | "task"
    }) => summaryService.approveTask(taskId, comment, signatureFileId, gateScope),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
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
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ])
    },
  })
}

export function useBatchArchive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchArchivePayload) => summaryService.batchArchive(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ])
    },
  })
}

export function usePostponeTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: PostponeTaskPayload }) =>
      summaryService.postponeTask(taskId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ])
    },
  })
}

export function useBatchPostpone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchPostponePayload) => summaryService.batchPostpone(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ])
    },
  })
}

export function useBatchReassign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BatchReassignPayload) => summaryService.batchReassign(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      ])
    },
  })
}
