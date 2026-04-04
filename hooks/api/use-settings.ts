import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  settingsService,
  type OrganisationSettings,
  type NotificationSettings,
} from "@/services/settings.service"

export function useOrganisationSettings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.settings.organisation,
    queryFn: () => settingsService.getOrganisation(),
    enabled,
  })
}

export function useUpdateOrganisationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<OrganisationSettings>) =>
      settingsService.updateOrganisation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.organisation })
    },
  })
}

export function useNotificationSettings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.settings.notifications,
    queryFn: () => settingsService.getNotifications(),
    enabled,
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<NotificationSettings>) =>
      settingsService.updateNotifications(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.notifications })
    },
  })
}
