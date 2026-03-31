"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/auth/otp-input"
import { useAuth } from "@/contexts/auth-context"
import { useMfaStore } from "@/stores/mfa-store"
import { useAuthSessionStore } from "@/stores/auth-session-store"
import { useToastStore } from "@/components/shared/toast"

export function MfaModal() {
  const { challengeMfa, verifyMfa } = useAuth()
  const mfaModalOpen = useMfaStore((s) => s.mfaModalOpen)
  const mfaGateActive = useMfaStore((s) => s.mfaGateActive)
  const pendingWrite = useMfaStore((s) => s.pendingWrite)
  const closeMfaModal = useMfaStore((s) => s.closeMfaModal)
  const deactivateMfaGate = useMfaStore((s) => s.deactivateMfaGate)
  const showToast = useToastStore((s) => s.show)

  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  // Send challenge code when modal opens
  /* eslint-disable react-hooks/set-state-in-effect -- intentional reset on modal open */
  useEffect(() => {
    if (!mfaModalOpen) return

    let cancelled = false

    // Reset state on open
    setCode("")
    setError(null)
    setSuccessMessage(null)
    setVerified(false)
    setIsSubmitting(false)

    const sendChallenge = async () => {
      setIsSendingCode(true)
      const result = await challengeMfa()
      if (cancelled) return

      if (!result.success) {
        // If BE says MFA is not required, dismiss the modal and sync session
        if (result.code === "MFA_NOT_REQUIRED") {
          const current = useAuthSessionStore.getState().session
          if (current) {
            useAuthSessionStore.getState().setSessionContext({
              ...current,
              mfaRequired: false,
            })
          }
          pendingWrite?.resolve({ success: true })
          deactivateMfaGate()
          setIsSendingCode(false)
          return
        }
        setError(mapChallengeError(result.message))
      } else {
        setSuccessMessage(mapDeliveryMessage(result.message))
      }

      setIsSendingCode(false)
    }

    void sendChallenge()
    return () => {
      cancelled = true
    }
  }, [challengeMfa, closeMfaModal, deactivateMfaGate, mfaModalOpen, pendingWrite])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleVerify = useCallback(async () => {
    if (code.length !== 6 || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const result = await verifyMfa(code)

    if (!result.success) {
      setError(result.message ?? "That code is invalid or expired. Try again.")
      setIsSubmitting(false)
      return
    }

    // MFA verified successfully
    setVerified(true)

    // Resolve pending write so the blocked request can retry
    pendingWrite?.resolve({ success: true })

    // Brief delay to show success state, then close and toast
    setTimeout(() => {
      deactivateMfaGate()
      showToast("MFA verified. You can now continue.")
    }, 1500)
  }, [code, deactivateMfaGate, isSubmitting, pendingWrite, showToast, verifyMfa])

  const handleResend = async () => {
    setError(null)
    setSuccessMessage(null)
    setIsSendingCode(true)

    const result = await challengeMfa()
    if (!result.success) {
      if (result.code === "MFA_NOT_REQUIRED") {
        const current = useAuthSessionStore.getState().session
        if (current) {
          useAuthSessionStore.getState().setSessionContext({
            ...current,
            mfaRequired: false,
          })
        }
        pendingWrite?.resolve({ success: true })
        deactivateMfaGate()
        setIsSendingCode(false)
        return
      }
      setError(mapChallengeError(result.message))
    } else {
      setSuccessMessage(mapDeliveryMessage(result.message))
    }

    setIsSendingCode(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (mfaGateActive) {
      return
    }

    if (!open && !verified) {
      closeMfaModal()
    }
  }

  const preventDismiss = mfaGateActive && !verified

  return (
    <Dialog open={mfaModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!verified && !mfaGateActive}
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (preventDismiss) {
            event.preventDefault()
          }
        }}
        onInteractOutside={(event) => {
          if (preventDismiss) {
            event.preventDefault()
          }
        }}
      >
        {verified ? (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">MFA is active</p>
              <p className="mt-1 text-sm text-gray-500">
                You can now make changes.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-center">
                MFA Verification
              </DialogTitle>
              <DialogDescription className="text-center">
                Enter the 6-digit security code sent to your email. Verification is required before you can continue.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && !error && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="py-2">
              <OTPInput
                value={code}
                onChange={setCode}
                onComplete={() => void handleVerify()}
                disabled={isSubmitting}
                error={Boolean(error)}
              />
            </div>

            <Button
              type="button"
              onClick={() => void handleVerify()}
              disabled={isSubmitting || code.length !== 6}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Verify and continue"
              )}
            </Button>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isSendingCode || isSubmitting}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isSendingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Send new code
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function mapChallengeError(message: string | undefined): string {
  if (!message) return "We couldn't deliver the code. Try resend."
  if (message.toLowerCase().includes("cooldown") || message.toLowerCase().includes("wait")) {
    return "Please wait before requesting another code."
  }
  return message
}

function mapDeliveryMessage(message: string | undefined): string {
  if (!message) return "Code sent to your email."
  const lower = message.toLowerCase()
  if (lower.includes("queued") || lower.includes("being sent")) {
    return "Code is being sent."
  }
  if (lower.includes("failed") || lower.includes("couldn't")) {
    return "We couldn't deliver the code. Try resend."
  }
  return message
}
