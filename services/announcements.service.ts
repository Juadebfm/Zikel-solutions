import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

export type AnnouncementStatus = "read" | "unread"

export interface Announcement {
  id: string
  title: string
  description: string
  images: string[]
  startsAt: string
  endsAt: string | null
  isPinned: boolean
  status: AnnouncementStatus
  createdAt: string
  updatedAt: string
}

export interface AnnouncementListResult {
  items: Announcement[]
  meta: ApiMeta
}

export interface CreateAnnouncementInput {
  title: string
  description: string
  images?: string[]
  startsAt: string
  endsAt?: string | null
  isPinned?: boolean
}

export interface UpdateAnnouncementInput {
  title?: string
  description?: string
  images?: string[]
  startsAt?: string
  endsAt?: string | null
  isPinned?: boolean
}

export interface GenericMessagePayload {
  message: string
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

export const announcementsService = {
  async getAnnouncements(params?: {
    status?: AnnouncementStatus
    page?: number
    limit?: number
  }): Promise<AnnouncementListResult> {
    const response = await apiRequest<Announcement[], ApiMeta>({
      path: "/announcements",
      auth: true,
      query: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    })

    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiRequest<Announcement>({
      path: `/announcements/${id}`,
      auth: true,
    })

    return response.data
  },

  async markAsRead(id: string): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: `/announcements/${id}/read`,
      method: "POST",
      auth: true,
    })

    return response.data
  },

  async createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
    const response = await apiRequest<Announcement>({
      path: "/announcements",
      method: "POST",
      auth: true,
      body: input,
    })

    return response.data
  },

  async updateAnnouncement(id: string, input: UpdateAnnouncementInput): Promise<Announcement> {
    const response = await apiRequest<Announcement>({
      path: `/announcements/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })

    return response.data
  },

  async deleteAnnouncement(id: string): Promise<GenericMessagePayload> {
    const response = await apiRequest<GenericMessagePayload>({
      path: `/announcements/${id}`,
      method: "DELETE",
      auth: true,
    })

    return response.data
  },
}

export default announcementsService
