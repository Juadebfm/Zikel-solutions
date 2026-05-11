import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import {
  billingService,
  pickBannerVariant,
  type BannerVariant,
  type PlanCode,
  type Subscription,
  type TopUpPackCode,
  type UpdateAiRestrictionsPayload,
} from "@/services/billing.service"

const SUBSCRIPTION_STALE_MS = 60 * 1000 // 60s
const QUOTA_STALE_MS = 30 * 1000 // 30s
const PLANS_STALE_MS = 60 * 60 * 1000 // 1h — plans rarely change

export function useSubscription(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billing.subscription,
    queryFn: () => billingService.getSubscription(),
    enabled,
    staleTime: SUBSCRIPTION_STALE_MS,
    refetchOnWindowFocus: true,
  })
}

export function usePlans(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: () => billingService.getPlans(),
    enabled,
    staleTime: PLANS_STALE_MS,
  })
}

export function useQuota(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billing.quota,
    queryFn: () => billingService.getQuota(),
    enabled,
    staleTime: QUOTA_STALE_MS,
    refetchOnWindowFocus: true,
  })
}

export function useInvoices(params: { page?: number; pageSize?: number } = {}, enabled = true) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  return useQuery({
    queryKey: queryKeys.billing.invoices({ page, pageSize }),
    queryFn: () => billingService.listInvoices({ page, pageSize }),
    enabled,
  })
}

export function useAiRestrictions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billing.aiRestrictions,
    queryFn: () => billingService.getAiRestrictions(),
    enabled,
  })
}

export function useUpdateAiRestrictions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateAiRestrictionsPayload) =>
      billingService.updateAiRestrictions(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.billing.aiRestrictions })
      await queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota })
    },
  })
}

export function useStartCheckoutSession() {
  return useMutation({
    mutationFn: (planCode: PlanCode) => billingService.createCheckoutSession(planCode),
    onSuccess: ({ url }) => {
      if (typeof window !== "undefined" && url) {
        window.location.assign(url)
      }
    },
  })
}

export function useStartTopUpSession() {
  return useMutation({
    mutationFn: (packCode: TopUpPackCode) => billingService.createTopupCheckoutSession(packCode),
    onSuccess: ({ url }) => {
      if (typeof window !== "undefined" && url) {
        window.location.assign(url)
      }
    },
  })
}

export function useStartPortalSession() {
  return useMutation({
    mutationFn: () => billingService.createPortalSession(),
    onSuccess: ({ url }) => {
      if (typeof window !== "undefined" && url) {
        window.location.assign(url)
      }
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription })
    },
  })
}

// ─── Derived selectors ──────────────────────────────────────────

export function useSubscriptionBannerVariant(): BannerVariant | null {
  const { data } = useSubscription()
  return pickBannerVariant(data)
}

export function useIsReadOnly(): boolean {
  const { data } = useSubscription()
  return Boolean(data?.ui.isReadOnly)
}

export function useTrialDaysLeft(): number | null {
  const { data } = useSubscription()
  if (!data?.ui.isInTrial) return null
  return data.ui.daysLeftInTrial ?? null
}

export function getSubscriptionFromQueryCache(
  queryClient: ReturnType<typeof useQueryClient>
): Subscription | undefined {
  return queryClient.getQueryData<Subscription>(queryKeys.billing.subscription)
}
