import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  tenantsService,
  type CreateTenantInviteInput,
} from "@/services/tenants.service"

export function useTenantInvites(
  tenantId: string | null | undefined,
  params?: {
    status?: string
    page?: number
    limit?: number
  }
) {
  const resolvedParams = {
    status: params?.status,
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.tenants.invites(tenantId ?? "none", resolvedParams),
    queryFn: () => tenantsService.listInvites(tenantId!, resolvedParams),
    enabled: Boolean(tenantId),
  })
}

export function useCreateTenantInvite(tenantId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTenantInviteInput) => tenantsService.createInvite(tenantId!, input),
    onSuccess: async () => {
      if (!tenantId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.invitesBase(tenantId),
      })
    },
  })
}

export function useRevokeTenantInvite(tenantId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) => tenantsService.revokeInvite(tenantId!, inviteId),
    onSuccess: async () => {
      if (!tenantId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.invitesBase(tenantId),
      })
    },
  })
}

export function useAcceptTenantInvite() {
  return useMutation({
    mutationFn: (token: string) => tenantsService.acceptInvite(token),
  })
}
