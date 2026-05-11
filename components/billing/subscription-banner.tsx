"use client"

import { useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, CreditCard, Loader2, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  useIsBillingEnabled,
  useStartPortalSession,
  useSubscription,
  useSubscriptionBannerVariant,
} from "@/hooks/api/use-billing"
import type { BannerVariant } from "@/services/billing.service"

const DISMISS_STORAGE_KEY = "zikel-subscription-trial-banner-dismissed"

function subscribeToStorage(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

function getTrialDismissalSnapshot(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(DISMISS_STORAGE_KEY)
}

function getTrialDismissalServerSnapshot(): string | null {
  return null
}

function setTrialDismissed() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DISMISS_STORAGE_KEY, "1")
}

function clearTrialDismissal() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(DISMISS_STORAGE_KEY)
}

function getVariantClasses(variant: BannerVariant): { container: string; icon: string; cta: string } {
  switch (variant) {
    case "trial":
    case "past_due_grace":
      return {
        container: "bg-amber-50 border-amber-200 text-amber-900",
        icon: "text-amber-600",
        cta: "bg-amber-600 hover:bg-amber-700 text-white",
      }
    case "past_due_readonly":
    case "incomplete":
    case "suspended":
    case "cancelled":
      return {
        container: "bg-red-50 border-red-200 text-red-900",
        icon: "text-red-600",
        cta: "bg-red-600 hover:bg-red-700 text-white",
      }
  }
}

export function SubscriptionBanner() {
  const variant = useSubscriptionBannerVariant()
  const { data: subscription, isLoading } = useSubscription()
  const { isEnabled: isBillingEnabled } = useIsBillingEnabled()
  const startPortalSession = useStartPortalSession()
  const dismissalRaw = useSyncExternalStore(
    subscribeToStorage,
    getTrialDismissalSnapshot,
    getTrialDismissalServerSnapshot,
  )

  const handleDismiss = useCallback(() => {
    setTrialDismissed()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new StorageEvent("storage", { key: DISMISS_STORAGE_KEY }))
    }
  }, [])

  if (isLoading || !variant || !isBillingEnabled) {
    return null
  }

  if (variant === "trial" && dismissalRaw !== null) {
    return null
  }

  if (variant !== "trial" && dismissalRaw !== null) {
    clearTrialDismissal()
  }

  const classes = getVariantClasses(variant)

  const daysLeft = subscription?.ui.daysLeftInTrial ?? null
  const pastDueDays = subscription?.ui.pastDueSinceDays ?? null

  let icon = AlertTriangle
  let title = ""
  let body: string | null = null
  let primaryCta: { label: string; onClick?: () => void; href?: string } | null = null
  const isDismissable = variant === "trial"

  switch (variant) {
    case "trial": {
      icon = Sparkles
      const daysCopy =
        daysLeft === null
          ? "Trial active"
          : daysLeft <= 0
            ? "Last day of trial"
            : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left in trial`
      title = daysCopy
      body = "Pick a plan to keep access after your trial ends."
      primaryCta = { label: "Choose a plan", href: "/settings/billing" }
      break
    }
    case "past_due_grace": {
      icon = CreditCard
      title = "Payment failed — update your card to keep working"
      body =
        pastDueDays !== null
          ? `We've been retrying since ${pastDueDays} ${pastDueDays === 1 ? "day" : "days"} ago.`
          : "We'll keep retrying for a few days."
      primaryCta = {
        label: "Update card",
        onClick: () => startPortalSession.mutate(),
      }
      break
    }
    case "past_due_readonly": {
      icon = AlertTriangle
      title = "Subscription past due — read-only mode active"
      body = "Mutations and AI are disabled until billing is up to date."
      primaryCta = {
        label: "Update card",
        onClick: () => startPortalSession.mutate(),
      }
      break
    }
    case "incomplete": {
      icon = AlertTriangle
      title = "Finish setting up your subscription"
      body = "Complete payment to unlock the full app."
      primaryCta = { label: "Complete payment", href: "/settings/billing" }
      break
    }
    case "suspended":
    case "cancelled": {
      icon = AlertTriangle
      title = variant === "suspended" ? "This organization is suspended" : "This organization is cancelled"
      body = "Contact support to restore access."
      primaryCta = null
      break
    }
  }

  const Icon = icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 ${classes.container}`}
    >
      <div className="flex items-start gap-3 sm:items-center">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 sm:mt-0 ${classes.icon}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          {body ? <p className="text-sm leading-tight opacity-90">{body}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {primaryCta ? (
          primaryCta.onClick ? (
            <Button
              size="sm"
              type="button"
              onClick={primaryCta.onClick}
              disabled={startPortalSession.isPending}
              className={classes.cta}
            >
              {startPortalSession.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : primaryCta.href ? (
            <Button
              asChild
              size="sm"
              type="button"
              className={classes.cta}
            >
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null
        ) : null}

        {isDismissable ? (
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
