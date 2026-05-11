"use client"

import Link from "next/link"
import { ArrowLeft, CreditCard } from "lucide-react"

import { AiRestrictionsForm } from "@/components/billing/ai-restrictions-form"
import { CancelSubscriptionDialog } from "@/components/billing/cancel-subscription-dialog"
import { CurrentPlanCard } from "@/components/billing/current-plan-card"
import { InvoiceTable } from "@/components/billing/invoice-table"
import { PlanSwitcher } from "@/components/billing/plan-switcher"
import { QuotaCard } from "@/components/billing/quota-card"
import { TopUpPacks } from "@/components/billing/top-up-packs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function BillingPage() {
  const { session } = useAuth()
  const isOwner = session?.activeTenantRole === "tenant_admin"

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
