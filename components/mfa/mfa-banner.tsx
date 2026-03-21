"use client"

import { ShieldAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMfaStore } from "@/stores/mfa-store"
import { useMfaAuthState } from "@/stores/mfa-store"

export function MfaBanner() {
  const mfaState = useMfaAuthState()
  const bannerDismissed = useMfaStore((s) => s.bannerDismissed)
  const dismissBanner = useMfaStore((s) => s.dismissBanner)
  const openMfaModal = useMfaStore((s) => s.openMfaModal)

  if (mfaState !== "authenticated_mfa_pending" || bannerDismissed) {
    return null
  }

  return (
    <div className="relative rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 sm:px-6 sm:py-5 mb-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-900">
            Secure your admin account
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            You can continue viewing your dashboard, but MFA is required before
            making changes. This protects resident data and your organization.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => openMfaModal()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Set up MFA now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissBanner}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            >
              Remind me later
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissBanner}
          className="shrink-0 rounded-md p-1 text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  )
}
