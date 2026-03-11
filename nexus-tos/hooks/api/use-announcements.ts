import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  announcementsService,
  type AnnouncementStatus,
} from "@/services/announcements.service"

export function useAnnouncements(params?: {
  status?: AnnouncementStatus
  page?: number
  limit?: number
}) {
  const resolvedParams = {
    status: params?.status,
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
  }

  return useQuery({
    queryKey: queryKeys.announcements.list(resolvedParams),
    queryFn: () => announcementsService.getAnnouncements(resolvedParams),
  })
}

export function useAnnouncementById(id: string) {
  return useQuery({
    queryKey: queryKeys.announcements.detail(id),
    queryFn: () => announcementsService.getAnnouncementById(id),
    enabled: Boolean(id),
  })
}

export function useMarkAnnouncementAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => announcementsService.markAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["announcements"] })
    },
  })
}
