import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ──────────────────────────────────────────────────────

export interface NotificationItem {
  id: string
  title: string
  description?: string | null
  category?: string | null
  link?: string | null
  read: boolean
  createdAt: string
  readAt?: string | null
}

export interface NotificationListResult {
  items: NotificationItem[]
  meta: ApiMeta
}

export interface UnreadCountResult {
  count: number
}

export interface NotificationPreference {
  category: string
  enabled: boolean
}

export interface BulkReadResult {
  updated: number
}

export interface NotificationListParams {
  page?: number
  pageSize?: number
  read?: boolean
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const notificationsService = {
  async list(params: NotificationListParams = {}): Promise<NotificationListResult> {
    const response = await apiRequest<NotificationItem[], ApiMeta>({
      path: "/notifications",
      auth: true,
      query: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        read: params.read,
      },
    })
    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getUnreadCount(): Promise<UnreadCountResult> {
    const response = await apiRequest<UnreadCountResult>({
      path: "/notifications/unread-count",
      auth: true,
    })
    return response.data
  },

  async markRead(id: string): Promise<{ id: string; read: true }> {
    const response = await apiRequest<{ id: string; read: true }>({
      path: `/notifications/${id}/read`,
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async markAllRead(): Promise<BulkReadResult> {
    const response = await apiRequest<BulkReadResult>({
      path: "/notifications/read-all",
      method: "POST",
      auth: true,
    })
    return response.data
  },

  async getPreferences(): Promise<NotificationPreference[]> {
    const response = await apiRequest<NotificationPreference[]>({
      path: "/notifications/preferences",
      auth: true,
    })
    return response.data
  },

  async updatePreferences(preferences: NotificationPreference[]): Promise<NotificationPreference[]> {
    const response = await apiRequest<NotificationPreference[]>({
      path: "/notifications/preferences",
      method: "PUT",
      auth: true,
      body: preferences,
    })
    return response.data
  },
}
