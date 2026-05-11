"use client"

import Link from "next/link"
import { ArrowLeft, CreditCard, Wrench } from "lucide-react"

import { AiRestrictionsForm } from "@/components/billing/ai-restrictions-form"
import { CancelSubscriptionDialog } from "@/components/billing/cancel-subscription-dialog"
import { CurrentPlanCard } from "@/components/billing/current-plan-card"
import { InvoiceTable } from "@/components/billing/invoice-table"
import { PlanSwitcher } from "@/components/billing/plan-switcher"
import { QuotaCard } from "@/components/billing/quota-card"
import { TopUpPacks } from "@/components/billing/top-up-packs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useIsBillingEnabled } from "@/hooks/api/use-billing"

export default function BillingPage() {
  const { session } = useAuth()
  const isOwner = session?.activeTenantRole === "tenant_admin"
  const { isEnabled: isBillingEnabled, isLoading: isBillingProbing } = useIsBillingEnabled()

  if (!isBillingProbing && !isBillingEnabled) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              Billing not configured
            </CardTitle>
            <CardDescription>
              Stripe-backed billing is not enabled in this environment. Contact Zikel support if you
              think this is a mistake.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/my-summary">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CreditCard className="h-6 w-6 text-primary" />
            Billing &amp; Subscription
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your plan, AI usage, and invoices. Payments are handled by Stripe.
          </p>
        </div>
      </div>

      <CurrentPlanCard />

      <PlanSwitcher />

      <TopUpPacks />

      <QuotaCard />

      {isOwner ? <AiRestrictionsForm /> : null}

      <InvoiceTable />

      <div className="flex justify-end">
        <CancelSubscriptionDialog />
      </div>
    </div>
  )
}
