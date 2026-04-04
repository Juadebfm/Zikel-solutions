import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  tasksService,
  type CreateTaskPayload,
  type TaskActionPayload,
  type TaskListParams,
  type UpdateTaskPayload,
} from "@/services/tasks.service"

export function useTaskList(params?: TaskListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    search: params?.search,
    status: params?.status,
    type: params?.type,
    category: params?.category,
    entityId: params?.entityId,
    assigneeId: params?.assigneeId,
    createdById: params?.createdById,
    period: params?.period,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    scope: params?.scope,
    formGroup: params?.formGroup,
    summaryScope: params?.summaryScope,
  }

  return useQuery({
    queryKey: queryKeys.tasks.list(resolvedParams),
    queryFn: () => tasksService.list(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useTaskDetail(taskId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => tasksService.getDetail(taskId),
    enabled: enabled && Boolean(taskId),
  })
}

export function useTaskCategories() {
  return useQuery({
    queryKey: queryKeys.tasks.categories,
    queryFn: () => tasksService.getCategories(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useTaskFormTemplates() {
  return useQuery({
    queryKey: queryKeys.tasks.formTemplates,
    queryFn: () => tasksService.getFormTemplates(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksService.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ])
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      tasksService.update(taskId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks", "list"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ])
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksService.remove(taskId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ])
    },
  })
}

export function useTaskAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskActionPayload }) =>
      tasksService.performAction(taskId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks", "list"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ])
    },
  })
}
