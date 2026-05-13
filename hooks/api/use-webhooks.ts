import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  webhooksService,
  type CreateWebhookInput,
  type UpdateWebhookInput,
  type WebhookDeliveriesParams,
} from "@/services/webhooks.service"

export function useWebhooks(enabled = true) {
  return useQuery({
    queryKey: queryKeys.webhooks.list,
    queryFn: () => webhooksService.list(),
    enabled,
  })
}

export function useWebhook(id: string | null, enabled = true) {
  return useQuery({
    queryKey: id ? queryKeys.webhooks.detail(id) : ["webhooks", "detail", "none"],
    queryFn: () => {
      if (!id) throw new Error("Webhook id missing")
      return webhooksService.get(id)
    },
    enabled: enabled && Boolean(id),
  })
}

export function useWebhookDeliveries(
  id: string | null,
  params: WebhookDeliveriesParams = {},
  enabled = true,
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  return useQuery({
    queryKey: id
      ? queryKeys.webhooks.deliveries(id, { page, pageSize })
      : ["webhooks", "deliveries", "none"],
    queryFn: () => {
      if (!id) throw new Error("Webhook id missing")
      return webhooksService.listDeliveries(id, { ...params, page, pageSize })
    },
    enabled: enabled && Boolean(id),
  })
}

export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWebhookInput) => webhooksService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list })
    },
  })
}

export function useUpdateWebhook(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateWebhookInput) => webhooksService.update(id, input),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.webhooks.detail(id), data)
      await queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list })
    },
  })
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => webhooksService.remove(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.webhooks.detail(id) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list })
    },
  })
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (id: string) => webhooksService.test(id),
  })
}
