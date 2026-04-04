import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  organisationService,
  type RegionListParams,
  type CreateRegionPayload,
  type GroupingListParams,
  type CreateGroupingPayload,
} from "@/services/organisation.service"

// ─── Regions ──────────────────────────────────────────────────────

export function useRegionList(params?: RegionListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    isActive: params?.isActive,
  }

  return useQuery({
    queryKey: queryKeys.organisation.regions(resolvedParams),
    queryFn: () => organisationService.listRegions(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useRegionDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.organisation.regionDetail(id),
    queryFn: () => organisationService.getRegion(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateRegion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRegionPayload) => organisationService.createRegion(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organisation", "regions"] })
    },
  })
}

export function useUpdateRegion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateRegionPayload> }) =>
      organisationService.updateRegion(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["organisation", "regions"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.regionDetail(variables.id) }),
      ])
    },
  })
}

export function useDeleteRegion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => organisationService.deleteRegion(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organisation", "regions"] })
    },
  })
}

// ─── Groupings ────────────────────────────────────────────────────

export function useGroupingList(params?: GroupingListParams) {
  const resolvedParams = {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
    type: params?.type,
    isActive: params?.isActive,
  }

  return useQuery({
    queryKey: queryKeys.organisation.groupings(resolvedParams),
    queryFn: () => organisationService.listGroupings(resolvedParams),
    placeholderData: keepPreviousData,
  })
}

export function useGroupingDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.organisation.groupingDetail(id),
    queryFn: () => organisationService.getGrouping(id),
    enabled: enabled && Boolean(id),
  })
}

export function useCreateGrouping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateGroupingPayload) => organisationService.createGrouping(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organisation", "groupings"] })
    },
  })
}

export function useUpdateGrouping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateGroupingPayload> }) =>
      organisationService.updateGrouping(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["organisation", "groupings"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organisation.groupingDetail(variables.id) }),
      ])
    },
  })
}

export function useDeleteGrouping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => organisationService.deleteGrouping(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organisation", "groupings"] })
    },
  })
}
