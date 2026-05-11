"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, KeyRound, Loader2, RefreshCw, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { OTPInput } from "@/components/auth/otp-input"
import { BrandMark } from "@/components/shared/brand-mark"
import { AuthErrorDialog } from "@/components/auth/auth-error-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/services/auth.service"
import { useAuthSessionStore } from "@/stores/auth-session-store"
import { getApiErrorMessage } from "@/lib/api/error"

export default function MfaVerifyPage() {
  const router = useRouter()
  const { user, challengeMfa, verifyMfa, logout } = useAuth()
  const setTokens = useAuthSessionStore((s) => s.setTokens)
  const setSessionContext = useAuthSessionStore((s) => s.setSessionContext)

  const [mode, setMode] = useState<"totp" | "backup">("totp")
  const [code, setCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const sendChallenge = async () => {
      if (!user || mode !== "totp") return
      setIsSendingCode(true)
      const result = await challengeMfa()
      if (cancelled) return

      if (!result.success) {
        setError(result.message ?? "Unable to send verification code.")
      } else {
        setSuccessMessage(result.message ?? "Verification code sent.")
      }

      setIsSendingCode(false)
    }

    void sendChallenge()
    return () => {
      cancelled = true
    }
  }, [challengeMfa, user, mode])

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter the 6-digit security code.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const result = await verifyMfa(code)
    if (!result.success) {
      setError(result.message ?? "Verification failed. Please try again.")
      setIsSubmitting(false)
      return
    }

    router.push(result.redirectTo ?? "/my-summary")
  }

  const handleVerifyBackup = async () => {
    const trimmed = backupCode.trim()
    if (trimmed.length < 8) {
      setError("Backup codes are at least 8 characters long.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const payload = await authService.verifyMfaBackup(trimmed)
      setTokens({
        accessToken: payload.accessToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        refreshTokenExpiresAt: payload.refreshTokenExpiresAt,
        serverTime: payload.serverTime,
      })
      if (payload.session) {
        setSessionContext({
          activeTenantId: payload.session.activeTenantId ?? null,
          activeTenantRole: payload.session.activeTenantRole ?? null,
          memberships: (payload.session.memberships ?? []).map((m) => ({
            id: m.id,
            tenantId: m.tenantId,
            tenantRole: m.tenantRole,
            isActive: m.isActive,
            status: m.status ?? undefined,
            tenantName: m.tenantName ?? undefined,
            tenantSlug: m.tenantSlug ?? undefined,
          })),
          mfaRequired: false,
          mfaVerified: true,
          idleExpiresAt: payload.session.idleExpiresAt ?? null,
          absoluteExpiresAt: payload.session.absoluteExpiresAt ?? null,
          warningWindowSeconds: payload.session.warningWindowSeconds ?? null,
        })
      }
      router.push("/my-summary")
    } catch (err) {
      setError(getApiErrorMessage(err, "Backup code verification failed."))
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setSuccessMessage(null)
    setIsSendingCode(true)

    const result = await challengeMfa()
    if (!result.success) {
      setError(result.message ?? "Unable to send verification code.")
    } else {
      setSuccessMessage(result.message ?? "Verification code sent.")
    }

    setIsSendingCode(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthErrorDialog
        open={Boolean(error)}
        message={error ?? ""}
        title="MFA verification issue"
        onOpenChange={(open) => {
          if (!open) {
            setError(null)
          }
        }}
      />

      {/* Logo - Mobile */}
      <div className="flex justify-center mb-8 lg:hidden">
        <BrandMark size={48} priority animated />
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MFA Verification</h1>
          <p className="text-gray-500 mt-2">
            Enter the security code sent to your email to continue.
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {mode === "totp" ? (
          <>
            <div className="mb-6">
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
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify and continue"}
            </Button>

            <div className="mt-4 flex items-center justify-between">
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
              <button
                type="button"
                onClick={() => {
                  setMode("backup")
                  setError(null)
                  setSuccessMessage(null)
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400"
              >
                <KeyRound className="h-4 w-4" />
                Use a backup code
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 space-y-2">
              <Label htmlFor="backup-code">Backup code</Label>
              <Input
                id="backup-code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="e.g. ABCD-EFGH-IJKL"
                disabled={isSubmitting}
                autoFocus
                autoComplete="one-time-code"
              />
              <p className="text-xs text-gray-500">
                Each backup code can only be used once.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => void handleVerifyBackup()}
              disabled={isSubmitting || backupCode.trim().length < 8}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify backup code"}
            </Button>

            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setMode("totp")
                  setError(null)
                  setSuccessMessage(null)
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 disabled:text-gray-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to verification code
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/my-summary")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
