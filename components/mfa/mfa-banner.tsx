"use client"

import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMfaStore } from "@/stores/mfa-store"
import { useMfaAuthState } from "@/stores/mfa-store"

export function MfaBanner() {
  const mfaState = useMfaAuthState()
  const openMfaModal = useMfaStore((s) => s.openMfaModal)

  if (mfaState !== "authenticated_mfa_pending") {
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
            MFA verification is required before you can continue.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => openMfaModal({ forceGate: true })}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Complete MFA
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
