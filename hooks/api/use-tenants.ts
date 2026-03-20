import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  tenantsService,
  type CreateTenantInviteLinkInput,
  type CreateTenantStaffInput,
  type CreateTenantInviteInput,
  type CreateSelfServeTenantInput,
  type UpdateTenantMembershipInput,
} from "@/services/tenants.service"

export function useTenantMemberships(
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
    queryKey: queryKeys.tenants.memberships(tenantId ?? "none", resolvedParams),
    queryFn: () => tenantsService.listMemberships(tenantId!, resolvedParams),
    enabled: Boolean(tenantId),
  })
}

export function useUpdateTenantMembership(tenantId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      membershipId,
      input,
    }: {
      membershipId: string
      input: UpdateTenantMembershipInput
    }) => tenantsService.updateMembership(tenantId!, membershipId, input),
    onSuccess: async () => {
      if (!tenantId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.membershipsBase(tenantId),
      })
    },
  })
}

export function useCreateTenantStaff(tenantId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTenantStaffInput) => tenantsService.createStaff(tenantId!, input),
    onSuccess: async () => {
      if (!tenantId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.membershipsBase(tenantId),
      })
    },
  })
}

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

export function useTenantInviteLinks(
  tenantId: string | null | undefined,
  params?: {
    page?: number
    limit?: number
  }
) {
  const resolvedParams = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.tenants.inviteLinks(tenantId ?? "none", resolvedParams),
    queryFn: () => tenantsService.listInviteLinks(tenantId!, resolvedParams),
    enabled: Boolean(tenantId),
  })
}

export function useCreateTenantInviteLink(tenantId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTenantInviteLinkInput) =>
      tenantsService.createInviteLink(tenantId!, input),
    onSuccess: async () => {
      if (!tenantId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.inviteLinksBase(tenantId),
      })
    },
  })
}

export function useRevokeTenantInviteLink(tenantId: string | null | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: string) => tenantsService.revokeInviteLink(tenantId!, linkId),
    onSuccess: async () => {
      if (!tenantId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.inviteLinksBase(tenantId),
      })
    },
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

export function useCreateSelfServeTenant() {
  return useMutation({
    mutationFn: (input: CreateSelfServeTenantInput) =>
      tenantsService.createSelfServeTenant(input),
  })
}
