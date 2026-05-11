import { apiRequest } from "@/lib/api/client"
import type { ApiMeta } from "@/lib/api/types"

// ─── Subscription ───────────────────────────────────────────────

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due_grace"
  | "past_due_readonly"
  | "incomplete"
  | "suspended"
  | "cancelled"

export type PlanCode = "standard_monthly" | "standard_annual"
export type TopUpPackCode = "topup_small" | "topup_medium" | "topup_large"
export type Currency = "gbp"
export type PlanInterval = "month" | "year"

export interface SubscriptionPlan {
  code: PlanCode
  name: string
  interval: PlanInterval
  unitAmountMinor: number
  currency: Currency
  bundledCallsPerPeriod: number
}

export interface SubscriptionUiFlags {
  isInTrial: boolean
  daysLeftInTrial: number | null
  isReadOnly: boolean
  isSuspended: boolean
  isCancelled: boolean
  pastDueSinceDays: number | null
}

export interface Subscription {
  status: SubscriptionStatus
  plan: SubscriptionPlan | null
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  pastDueSince: string | null
  manuallyOverriddenUntil: string | null
  ui: SubscriptionUiFlags
}

// ─── Plans catalogue ────────────────────────────────────────────

export interface TopUpPack {
  code: TopUpPackCode
  name: string
  unitAmountMinor: number
  currency: Currency
  calls: number
}

export interface PlansCatalogue {
  plans: SubscriptionPlan[]
  topUpPacks: TopUpPack[]
}

// ─── Quota ──────────────────────────────────────────────────────

export type TenantRoleKey = "tenant_admin" | "sub_admin" | "staff"

export interface QuotaPerUserUsage {
  userId: string
  name: string
  email: string
  role: TenantRoleKey | string
  callsThisPeriod: number
}

export interface QuotaRestrictions {
  perRoleCaps: Record<string, number | null>
  perUserCaps: Record<string, number | null>
}

export interface Quota {
  allocationId: string
  bundledCalls: number
  topUpCalls: number
  usedCalls: number
  remainingCalls: number
  periodStart: string
  periodEnd: string
  resetAt: string
  perUserUsage: QuotaPerUserUsage[]
  restrictions: QuotaRestrictions
}

// ─── Invoices ───────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible"

export interface Invoice {
  id: string
  stripeInvoiceId: string
  amountDueMinor: number
  amountPaidMinor: number
  currency: Currency
  status: InvoiceStatus
  hostedInvoiceUrl: string | null
  pdfUrl: string | null
  periodStart: string | null
  periodEnd: string | null
  paidAt: string | null
  createdAt: string
}

// ─── AI restrictions ────────────────────────────────────────────

export interface AiRestrictions {
  perRoleCaps: Record<string, number | null>
  perUserCaps: Record<string, number | null>
  updatedAt: string | null
}

export interface UpdateAiRestrictionsPayload {
  perRoleCaps?: Record<string, number | null>
  perUserCaps?: Record<string, number | null>
}

// ─── Checkout / portal session responses ────────────────────────

export interface CheckoutSessionResponse {
  url: string
  expiresAt: string
}

export interface PortalSessionResponse {
  url: string
}

export interface CancelSubscriptionResponse {
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
}

// ─── Service ────────────────────────────────────────────────────

export const billingService = {
  async getSubscription(): Promise<Subscription> {
    const response = await apiRequest<Subscription>({
      path: "/billing/subscription",
      auth: true,
    })
    return response.data
  },

  async getPlans(): Promise<PlansCatalogue> {
    const response = await apiRequest<PlansCatalogue>({
      path: "/billing/plans",
      auth: true,
    })
    return response.data
  },

  async getQuota(): Promise<Quota> {
    const response = await apiRequest<Quota>({
      path: "/billing/quota",
      auth: true,
    })
    return response.data
  },

  async listInvoices(params: { page?: number; pageSize?: number } = {}): Promise<{ data: Invoice[]; meta: ApiMeta }> {
    const response = await apiRequest<Invoice[]>({
      path: "/billing/invoices",
      auth: true,
      query: {
        page: params.page,
        pageSize: params.pageSize,
      },
    })
    return {
      data: response.data,
      meta: (response.meta as ApiMeta) ?? { total: response.data.length, page: 1, pageSize: response.data.length, totalPages: 1 },
    }
  },

  async getAiRestrictions(): Promise<AiRestrictions> {
    const response = await apiRequest<AiRestrictions>({
      path: "/billing/ai-restrictions",
      auth: true,
    })
    return response.data
  },

  async updateAiRestrictions(payload: UpdateAiRestrictionsPayload): Promise<AiRestrictions> {
    const response = await apiRequest<AiRestrictions>({
      path: "/billing/ai-restrictions",
      auth: true,
      method: "PUT",
      body: payload,
    })
    return response.data
  },

  async createCheckoutSession(planCode: PlanCode): Promise<CheckoutSessionResponse> {
    const response = await apiRequest<CheckoutSessionResponse>({
      path: "/billing/checkout-session",
      auth: true,
      method: "POST",
      body: { planCode },
    })
    return response.data
  },

  async createTopupCheckoutSession(packCode: TopUpPackCode): Promise<CheckoutSessionResponse> {
    const response = await apiRequest<CheckoutSessionResponse>({
      path: "/billing/topup-checkout-session",
      auth: true,
      method: "POST",
      body: { packCode },
    })
    return response.data
  },

  async createPortalSession(): Promise<PortalSessionResponse> {
    const response = await apiRequest<PortalSessionResponse>({
      path: "/billing/portal-session",
      auth: true,
      method: "POST",
    })
    return response.data
  },

  async cancelSubscription(): Promise<CancelSubscriptionResponse> {
    const response = await apiRequest<CancelSubscriptionResponse>({
      path: "/billing/cancel",
      auth: true,
      method: "POST",
    })
    return response.data
  },
}

// ─── Helpers (pure, exported for reuse) ─────────────────────────

export type BannerVariant =
  | "trial"
  | "past_due_grace"
  | "past_due_readonly"
  | "incomplete"
  | "suspended"
  | "cancelled"

export function pickBannerVariant(subscription: Subscription | null | undefined): BannerVariant | null {
  if (!subscription) return null
  const { status, ui } = subscription

  if (ui.isSuspended) return "suspended"
  if (ui.isCancelled) return "cancelled"
  if (status === "incomplete") return "incomplete"
  if (status === "past_due_readonly") return "past_due_readonly"
  if (status === "past_due_grace") return "past_due_grace"
  if (ui.isInTrial) return "trial"
  return null
}

export function formatMinorAmount(minor: number, currency: Currency = "gbp"): string {
  const symbol = currency === "gbp" ? "£" : ""
  const amount = (minor / 100).toFixed(minor % 100 === 0 ? 0 : 2)
  return `${symbol}${amount}`
}
