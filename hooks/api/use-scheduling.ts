import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  schedulingService,
  type CalendarEventListParams,
  type CreateCalendarEventPayload,
  type UpdateCalendarEventPayload,
  type RotaListParams,
  type CreateRotaPayload,
  type CreateRotaTemplatePayload,
} from "@/services/scheduling.service"

// ─── Calendar Events ──────────────────────────────────────────────

export function useCalendarEvents(params?: CalendarEventListParams) {
  const resolvedParams = {
    homeId: params?.homeId,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    type: params?.type,
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.scheduling.events(resolvedParams),
    queryFn: () => schedulingService.listEvents(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useCalendarEventDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scheduling.eventDetail(id),
    queryFn: () => schedulingService.getEvent(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCalendarEventPayload) => schedulingService.createEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["scheduling", "events"] })
    },
  })
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCalendarEventPayload }) =>
      schedulingService.updateEvent(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["scheduling", "events"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.scheduling.eventDetail(variables.id) }),
      ])
    },
  })
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["scheduling", "events"] })
    },
  })
}

// ─── Rotas ────────────────────────────────────────────────────────

export function useRotaList(params?: RotaListParams) {
  const resolvedParams = {
    homeId: params?.homeId,
    weekStarting: params?.weekStarting,
    employeeId: params?.employeeId,
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.scheduling.rotas(resolvedParams),
    queryFn: () => schedulingService.listRotas(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useRotaDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.scheduling.rotaDetail(id),
    queryFn: () => schedulingService.getRota(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateRota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRotaPayload) => schedulingService.createRota(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["scheduling", "rotas"] })
    },
  })
}

export function useUpdateRota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateRotaPayload> }) =>
      schedulingService.updateRota(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["scheduling", "rotas"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.scheduling.rotaDetail(variables.id) }),
      ])
    },
  })
}

export function useDeleteRota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteRota(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["scheduling", "rotas"] })
    },
  })
}

// ─── Rota Templates ──────────────────────────────────────────────

export function useRotaTemplates() {
  return useQuery({
    queryKey: queryKeys.scheduling.rotaTemplates,
    queryFn: () => schedulingService.listRotaTemplates(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateRotaTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRotaTemplatePayload) => schedulingService.createRotaTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.scheduling.rotaTemplates })
    },
  })
}
