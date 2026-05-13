import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Types ──────────────────────────────────────────────────────

export interface Webhook {
  id: string
  url: string
  events: string[]
  description?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  status: "pending" | "success" | "failed"
  statusCode?: number | null
  responseBody?: string | null
  attemptCount: number
  deliveredAt?: string | null
  createdAt: string
}

export interface CreateWebhookInput {
  url: string
  events: string[]
  description?: string
  active?: boolean
}

export interface UpdateWebhookInput {
  url?: string
  events?: string[]
  description?: string | null
  active?: boolean
}

export interface WebhookDeliveriesParams {
  page?: number
  pageSize?: number
  status?: "pending" | "success" | "failed"
  dateFrom?: string
  dateTo?: string
}

export interface WebhookDeliveriesResult {
  items: WebhookDelivery[]
  meta: ApiMeta
}

export interface TestWebhookResult {
  deliveryId: string
  message: string
}

const DEFAULT_META: ApiMeta = {
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
}

// ─── Service ────────────────────────────────────────────────────

export const webhooksService = {
  async list(): Promise<Webhook[]> {
    const response = await apiRequest<Webhook[]>({
      path: "/webhooks",
      auth: true,
    })
    return response.data
  },

  async get(id: string): Promise<Webhook> {
    const response = await apiRequest<Webhook>({
      path: `/webhooks/${id}`,
      auth: true,
    })
    return response.data
  },

  async create(input: CreateWebhookInput): Promise<Webhook> {
    const response = await apiRequest<Webhook>({
      path: "/webhooks",
      method: "POST",
      auth: true,
      body: input,
    })
    return response.data
  },

  async update(id: string, input: UpdateWebhookInput): Promise<Webhook> {
    const response = await apiRequest<Webhook>({
      path: `/webhooks/${id}`,
      method: "PATCH",
      auth: true,
      body: input,
    })
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiRequest<{ deleted: true }>({
      path: `/webhooks/${id}`,
      method: "DELETE",
      auth: true,
    })
  },

  async listDeliveries(
    id: string,
    params: WebhookDeliveriesParams = {},
  ): Promise<WebhookDeliveriesResult> {
    const response = await apiRequest<WebhookDelivery[], ApiMeta>({
      path: `/webhooks/${id}/deliveries`,
      auth: true,
      query: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        status: params.status,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      },
    })
    return {
      items: response.data,
      meta: response.meta ?? DEFAULT_META,
    }
  },

  async test(id: string): Promise<TestWebhookResult> {
    const response = await apiRequest<TestWebhookResult>({
      path: `/webhooks/${id}/test`,
      method: "POST",
      auth: true,
    })
    return response.data
  },
}
