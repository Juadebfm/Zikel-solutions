import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  notificationsService,
  type NotificationListParams,
  type NotificationPreference,
} from "@/services/notifications.service"

export function useNotifications(params: NotificationListParams = {}, enabled = true) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  return useQuery({
    queryKey: queryKeys.notifications.list({ page, pageSize, read: params.read }),
    queryFn: () => notificationsService.list({ page, pageSize, read: params.read }),
    enabled,
  })
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.listBase })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.listBase })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
    },
  })
}

export function useNotificationPreferences(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.preferences,
    queryFn: () => notificationsService.getPreferences(),
    enabled,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (prefs: NotificationPreference[]) => notificationsService.updatePreferences(prefs),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences })
    },
  })
}
