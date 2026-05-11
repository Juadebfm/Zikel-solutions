"use client"

import { Loader2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlans, useStartTopUpSession, useSubscription } from "@/hooks/api/use-billing"
import { formatMinorAmount } from "@/services/billing.service"

export function TopUpPacks() {
  const { data: subscription } = useSubscription()
  const { data: catalogue, isLoading } = usePlans()
  const startTopUp = useStartTopUpSession()

  if (isLoading || !catalogue) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </CardContent>
      </Card>
    )
  }

  const hasActiveSub = Boolean(subscription?.plan) && !subscription?.ui.isSuspended && !subscription?.ui.isCancelled
  const packs = [...catalogue.topUpPacks].sort((a, b) => a.unitAmountMinor - b.unitAmountMinor)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          AI top-ups
        </CardTitle>
        <CardDescription>
          One-time AI call packs. They stack on top of your plan&apos;s bundled calls and never expire
          within a billing period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasActiveSub ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Subscribe to a plan before purchasing a top-up.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          {packs.map((pack) => {
            const isPending = startTopUp.isPending && startTopUp.variables === pack.code
            return (
              <div key={pack.code} className="flex flex-col rounded-xl border border-border p-4">
                <h3 className="text-base font-semibold">{pack.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {formatMinorAmount(pack.unitAmountMinor, pack.currency)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pack.calls.toLocaleString()} AI calls
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-4"
                  variant="outline"
                  onClick={() => startTopUp.mutate(pack.code)}
                  disabled={!hasActiveSub || startTopUp.isPending}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Buy
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
