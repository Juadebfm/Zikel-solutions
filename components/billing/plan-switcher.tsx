"use client"

import { Check, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlans, useStartCheckoutSession, useSubscription } from "@/hooks/api/use-billing"
import { formatMinorAmount, type SubscriptionPlan } from "@/services/billing.service"

function intervalLabel(plan: SubscriptionPlan): string {
  return plan.interval === "year" ? "year" : "month"
}

function annualSavingsHint(monthly: SubscriptionPlan | undefined, annual: SubscriptionPlan | undefined): string | null {
  if (!monthly || !annual) return null
  const annualizedMonthly = monthly.unitAmountMinor * 12
  const savings = annualizedMonthly - annual.unitAmountMinor
  if (savings <= 0) return null
  return `Save ${formatMinorAmount(savings, annual.currency)} per year`
}

export function PlanSwitcher() {
  const { data: subscription } = useSubscription()
  const { data: catalogue, isLoading } = usePlans()
  const startCheckout = useStartCheckoutSession()

  if (isLoading || !catalogue) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    )
  }

  const monthly = catalogue.plans.find((p) => p.interval === "month")
  const annual = catalogue.plans.find((p) => p.interval === "year")
  const currentPlanCode = subscription?.plan?.code
  const savingsHint = annualSavingsHint(monthly, annual)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a plan</CardTitle>
        <CardDescription>
          All plans include the same features. Annual saves you money up front.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {catalogue.plans.map((plan) => {
            const isCurrent = plan.code === currentPlanCode
            const isPending = startCheckout.isPending && startCheckout.variables === plan.code
            const isAnnual = plan.interval === "year"

            return (
              <div
                key={plan.code}
                className={`flex flex-col rounded-xl border p-5 ${
                  isCurrent ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  {isAnnual && savingsHint ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <Sparkles className="h-3 w-3" />
                      {savingsHint}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {formatMinorAmount(plan.unitAmountMinor, plan.currency)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {intervalLabel(plan)}</span>
                </div>

                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    {plan.bundledCallsPerPeriod.toLocaleString()} AI calls included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    Top-ups available anytime
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    Full app access
                  </li>
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <Button type="button" variant="outline" disabled className="w-full">
                      <Check className="h-4 w-4" />
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => startCheckout.mutate(plan.code)}
                      disabled={startCheckout.isPending}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {currentPlanCode ? "Switch to this plan" : "Choose this plan"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
