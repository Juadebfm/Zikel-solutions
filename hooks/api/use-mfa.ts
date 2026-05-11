import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authService } from "@/services/auth.service"

const mfaStatusKey = ["auth", "mfa", "status"] as const

export function useMfaStatus(enabled = true) {
  return useQuery({
    queryKey: mfaStatusKey,
    queryFn: () => authService.getMfaStatus(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSetupMfaTotp() {
  return useMutation({
    mutationFn: () => authService.setupMfaTotp(),
  })
}

export function useVerifySetupMfaTotp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => authService.verifySetupMfaTotp(code),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mfaStatusKey })
    },
  })
}

export function useDisableMfaTotp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (currentPassword: string) => authService.disableMfaTotp(currentPassword),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mfaStatusKey })
    },
  })
}
