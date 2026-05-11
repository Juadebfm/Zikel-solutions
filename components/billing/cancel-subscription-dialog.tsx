"use client"

import { useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCancelSubscription, useSubscription } from "@/hooks/api/use-billing"
import { useToastStore } from "@/components/shared/toast"
import { getApiErrorMessage } from "@/lib/api/error"

function formatDate(value: string | null | undefined): string {
  if (!value) return "the end of the current period"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "the end of the current period"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function CancelSubscriptionDialog() {
  const { data: subscription } = useSubscription()
  const cancelMutation = useCancelSubscription()
  const showToast = useToastStore((s) => s.show)
  const [open, setOpen] = useState(false)

  const alreadyCancelled = subscription?.cancelAtPeriodEnd === true
  const canCancel = Boolean(subscription?.plan) && !alreadyCancelled

  const handleConfirm = async () => {
    try {
      const result = await cancelMutation.mutateAsync()
      showToast(`Subscription will end on ${formatDate(result.currentPeriodEnd)}.`)
      setOpen(false)
    } catch (error) {
      showToast(getApiErrorMessage(error))
    }
  }

  if (!subscription?.plan) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          disabled={!canCancel}
        >
          {alreadyCancelled ? "Cancellation scheduled" : "Cancel subscription"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Cancel subscription?</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;ll keep full access until{" "}
            <span className="font-medium text-foreground">
              {formatDate(subscription.currentPeriodEnd)}
            </span>
            . After that, the org switches to read-only mode until billing is restored.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={cancelMutation.isPending}
          >
            Keep subscription
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirm}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Yes, cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
