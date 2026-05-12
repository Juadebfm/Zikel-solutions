"use client"

import { CalendarClock, CreditCard, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { MutationButton } from "@/components/ui/mutation-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStartPortalSession, useSubscription } from "@/hooks/api/use-billing"
import { formatMinorAmount, type Subscription } from "@/services/billing.service"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function statusBadge(subscription: Subscription) {
  const { status, ui } = subscription
  if (ui.isInTrial) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Trial</Badge>
  if (status === "active") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
  if (status === "past_due_grace") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Payment failed</Badge>
  if (status === "past_due_readonly") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Past due — read only</Badge>
  if (status === "incomplete") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Incomplete</Badge>
  if (status === "cancelled") return <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">Cancelled</Badge>
  if (status === "suspended") return <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">Suspended</Badge>
  return <Badge variant="outline">{status}</Badge>
}

export function CurrentPlanCard() {
  const { data: subscription, isLoading } = useSubscription()
  const startPortalSession = useStartPortalSession()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No subscription yet</CardTitle>
          <CardDescription>Pick a plan below to get started.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const plan = subscription.plan
  const priceLabel = plan
    ? `${formatMinorAmount(plan.unitAmountMinor, plan.currency)} / ${plan.interval}`
    : "No plan selected"

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Current plan
            </CardTitle>
            <CardDescription>
              {plan?.name ?? "No active plan"} · {priceLabel}
            </CardDescription>
          </div>
          {statusBadge(subscription)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {subscription.ui.isInTrial ? (
            <div className="flex items-center gap-2 text-amber-700">
              <CalendarClock className="h-4 w-4" />
              <span>
                Trial ends{" "}
                <span className="font-medium">{formatDate(subscription.trialEndsAt)}</span>
                {subscription.ui.daysLeftInTrial !== null
                  ? ` (${subscription.ui.daysLeftInTrial} ${subscription.ui.daysLeftInTrial === 1 ? "day" : "days"} left)`
                  : null}
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <span>
              {subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"}{" "}
              <span className="font-medium text-foreground">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </span>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your subscription is set to cancel at the end of the current period. You can resume it
            anytime from the customer portal.
          </div>
        ) : null}

        {subscription.manuallyOverriddenUntil ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Support override active until {formatDate(subscription.manuallyOverriddenUntil)}.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <MutationButton
            type="button"
            variant="outline"
            onClick={() => startPortalSession.mutate()}
            disabled={startPortalSession.isPending}
            ignoreReadOnly
            cooldownFamily="billing"
          >
            {startPortalSession.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Manage card &amp; invoices
          </MutationButton>
        </div>
      </CardContent>
    </Card>
  )
}
