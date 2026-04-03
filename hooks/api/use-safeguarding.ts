import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  safeguardingService,
  type ChronologyQueryParams,
  type RiskAlertQueryParams,
  type PatternQueryParams,
  type ReflectivePromptResponse,
} from "@/services/safeguarding.service"

// ─── Chronology ─────────────────────────────────────────────────

export function useYoungPersonChronology(
  youngPersonId: string,
  params?: ChronologyQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.safeguarding.chronologyYoungPerson(youngPersonId, { ...params }),
    queryFn: () => safeguardingService.getYoungPersonChronology(youngPersonId, params),
    enabled: enabled && Boolean(youngPersonId),
    placeholderData: keepPreviousData,
  })
}

export function useHomeChronology(
  homeId: string,
  params?: ChronologyQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.safeguarding.chronologyHome(homeId, { ...params }),
    queryFn: () => safeguardingService.getHomeChronology(homeId, params),
    enabled: enabled && Boolean(homeId),
    placeholderData: keepPreviousData,
  })
}

// ─── Risk Alerts ────────────────────────────────────────────────

export function useRiskAlerts(params?: RiskAlertQueryParams) {
  const resolvedParams = {
    status: params?.status,
    severity: params?.severity,
    type: params?.type,
    targetType: params?.targetType,
    targetId: params?.targetId,
    ownerUserId: params?.ownerUserId,
    includeNotes: params?.includeNotes,
    confidentialityScope: params?.confidentialityScope,
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.safeguarding.riskAlerts(resolvedParams),
    queryFn: () => safeguardingService.getRiskAlerts(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useRiskAlertDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.safeguarding.riskAlertDetail(id),
    queryFn: () => safeguardingService.getRiskAlertById(id),
    enabled: enabled && Boolean(id),
  })
}

export function useRiskAlertRules() {
  return useQuery({
    queryKey: queryKeys.safeguarding.riskAlertRules,
    queryFn: () => safeguardingService.getRiskAlertRules(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useEvaluateRiskAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => safeguardingService.evaluateRiskAlerts(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["safeguarding", "risk-alerts"] })
    },
  })
}

export function useAcknowledgeRiskAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => safeguardingService.acknowledgeRiskAlert(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["safeguarding", "risk-alerts"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.safeguarding.riskAlertDetail(id) }),
      ])
    },
  })
}

export function useMarkRiskAlertInProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => safeguardingService.markRiskAlertInProgress(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["safeguarding", "risk-alerts"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.safeguarding.riskAlertDetail(id) }),
      ])
    },
  })
}

export function useResolveRiskAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => safeguardingService.resolveRiskAlert(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["safeguarding", "risk-alerts"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.safeguarding.riskAlertDetail(id) }),
      ])
    },
  })
}

export function useAddRiskAlertNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      safeguardingService.addRiskAlertNote(id, content),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.safeguarding.riskAlertDetail(id),
      })
    },
  })
}

// ─── Pattern Mapping ────────────────────────────────────────────

export function useYoungPersonPatterns(
  youngPersonId: string,
  params?: PatternQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.safeguarding.patternsYoungPerson(youngPersonId, { ...params }),
    queryFn: () => safeguardingService.getYoungPersonPatterns(youngPersonId, params),
    enabled: enabled && Boolean(youngPersonId),
  })
}

export function useHomePatterns(
  homeId: string,
  params?: PatternQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.safeguarding.patternsHome(homeId, { ...params }),
    queryFn: () => safeguardingService.getHomePatterns(homeId, params),
    enabled: enabled && Boolean(homeId),
  })
}

// ─── Reflective Prompts ─────────────────────────────────────────

export function useReflectivePrompts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.safeguarding.reflectivePrompts,
    queryFn: () => safeguardingService.getReflectivePrompts(),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useSaveReflectiveResponses() {
  return useMutation({
    mutationFn: ({
      taskId,
      responses,
    }: {
      taskId: string
      responses: ReflectivePromptResponse[]
    }) => safeguardingService.saveReflectiveResponses(taskId, responses),
  })
}
