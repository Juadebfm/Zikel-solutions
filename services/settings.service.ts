import { apiRequest } from "@/lib/api/client"

// ─── Types ──────────────────────────────────────────────────────

export type DigestFrequency = "off" | "daily" | "weekly" | "monthly"

export interface OrganisationSettings {
  name: string
  timezone: string
  locale: string
  dateFormat: string
  logoUrl?: string | null
  notificationDefaults?: Record<string, unknown> | null
  passwordPolicy?: Record<string, unknown> | null
  sessionTimeout: number
  mfaRequired: boolean
  ipRestriction?: string | null
  dataRetentionDays: number
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  digestFrequency: DigestFrequency
}

// ─── Service ────────────────────────────────────────────────────

export const settingsService = {
  async getOrganisation(): Promise<OrganisationSettings> {
    const response = await apiRequest<OrganisationSettings>({
      path: "/settings/organisation",
      auth: true,
    })
    return response.data
  },

  async updateOrganisation(payload: Partial<OrganisationSettings>): Promise<OrganisationSettings> {
    const response = await apiRequest<OrganisationSettings>({
      path: "/settings/organisation",
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return response.data
  },

  async getNotifications(): Promise<NotificationSettings> {
    const response = await apiRequest<NotificationSettings>({
      path: "/settings/notifications",
      auth: true,
    })
    return response.data
  },

  async updateNotifications(payload: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiRequest<NotificationSettings>({
      path: "/settings/notifications",
      auth: true,
      method: "PATCH",
      body: payload,
    })
    return response.data
  },
}
