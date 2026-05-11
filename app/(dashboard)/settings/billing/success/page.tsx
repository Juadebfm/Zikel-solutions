"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { queryKeys } from "@/lib/query-keys"

export default function BillingCheckoutSuccessPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.billing.subscription })
    void queryClient.invalidateQueries({ queryKey: queryKeys.billing.quota })
    void queryClient.invalidateQueries({ queryKey: queryKeys.billing.invoicesBase })
  }, [queryClient])

  return (
    <div className="mx-auto max-w-xl py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle>Thanks — payment received</CardTitle>
          <CardDescription>
            Your subscription is now active. It may take a few seconds for everything to sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button asChild>
            <Link href="/my-summary">
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings/billing">View billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
