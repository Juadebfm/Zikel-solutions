"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/auth/otp-input"
import { AuthErrorDialog } from "@/components/auth/auth-error-dialog"
import { useLanguage } from "@/contexts/language-context"
import {
  getOtpDeliveryStatusMessage,
  getPublicAuthErrorMessage,
  getResendCooldownSeconds,
} from "@/lib/auth/otp"
import { isApiClientError } from "@/lib/api/error"
import type { OtpDeliveryStatus, ResendOtpPayload } from "@/services/auth.service"

interface VerificationResult {
  success: boolean
  message?: string
}

interface StepVerificationProps {
  email: string
  onVerify: (code: string) => Promise<VerificationResult>
  onResend: () => Promise<ResendOtpPayload>
  onBack: () => void
  initialResendAvailableAt?: string | null
  deliveryStatus?: OtpDeliveryStatus | null
  deliveryMessage?: string | null
}

export function StepVerification({
  email,
  onVerify,
  onResend,
  onBack,
  initialResendAvailableAt = null,
  deliveryStatus = null,
  deliveryMessage = null,
}: StepVerificationProps) {
  const { t } = useLanguage()
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(() => getResendCooldownSeconds(initialResendAvailableAt))
  const [currentDeliveryStatus, setCurrentDeliveryStatus] = useState<OtpDeliveryStatus | null>(deliveryStatus)
  const [currentDeliveryMessage, setCurrentDeliveryMessage] = useState<string | null>(deliveryMessage)

  useEffect(() => {
    setCurrentDeliveryStatus(deliveryStatus)
    setCurrentDeliveryMessage(deliveryMessage)
  }, [deliveryMessage, deliveryStatus])

  useEffect(() => {
    setCooldown(getResendCooldownSeconds(initialResendAvailableAt))
  }, [initialResendAvailableAt])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const result = await onVerify(code)
      if (!result.success) {
        setError(result.message ?? "Invalid verification code. Please try again.")
      }
    } catch (error) {
      setError(getPublicAuthErrorMessage(error, "An error occurred. Please try again."))
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return

    setIsResending(true)
    setError(null)

    try {
      const payload = await onResend()
      setCooldown(getResendCooldownSeconds(payload.resendAvailableAt))
      setCurrentDeliveryStatus(payload.otpDeliveryStatus)
      setCurrentDeliveryMessage(getOtpDeliveryStatusMessage(payload.otpDeliveryStatus))
    } catch (error) {
      const cooldownSeconds = getCooldownSecondsFromError(error)
      if (cooldownSeconds > 0) {
        setCooldown(cooldownSeconds)
      }
      setError(getPublicAuthErrorMessage(error, "Failed to resend code. Please try again."))
    } finally {
      setIsResending(false)
    }
  }

  const handleComplete = async (completedCode: string) => {
    setCode(completedCode)

    // Auto-submit when code is complete
    setIsVerifying(true)
    setError(null)

    try {
      const result = await onVerify(completedCode)
      if (!result.success) {
        setError(result.message ?? "Invalid verification code. Please try again.")
      }
    } catch (error) {
      setError(getPublicAuthErrorMessage(error, "An error occurred. Please try again."))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthErrorDialog
        open={Boolean(error)}
        message={error ?? ""}
        title="Verification issue"
        onOpenChange={(open) => {
          if (!open) {
            setError(null)
          }
        }}
      />

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.signup.step4.heading")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("auth.signup.step4.description")}{" "}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {currentDeliveryMessage && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              currentDeliveryStatus === "failed"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {currentDeliveryMessage}
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <OTPInput
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={isVerifying}
            error={!!error}
          />
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={code.length !== 6 || isVerifying}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
        >
          {isVerifying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            t("auth.signup.step4.verifyButton")
          )}
        </Button>

        {/* Resend Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {cooldown > 0 ? (
              <span>{t("auth.signup.step4.resendCode")} in {cooldown}s</span>
            ) : (
              <span>{t("auth.signup.step4.resendCode")}</span>
            )}
          </button>
        </div>
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-2 w-full max-w-md mx-auto mt-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">{t("common.back")}</span>
      </button>
    </div>
  )
}

function getCooldownSecondsFromError(error: unknown): number {
  if (!isApiClientError(error)) {
    return 0
  }

  const values = collectNumericDetails(error.details)
  for (const value of values) {
    if (Number.isFinite(value) && value > 0) {
      return Math.ceil(value)
    }
  }

  return 0
}

function collectNumericDetails(value: unknown, out: number[] = []): number[] {
  if (typeof value === "number") {
    out.push(value)
    return out
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) {
      out.push(parsed)
    }
    return out
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectNumericDetails(item, out)
    }
    return out
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    for (const [key, nestedValue] of Object.entries(record)) {
      if (/retry|cooldown|wait|after|reset/i.test(key)) {
        collectNumericDetails(nestedValue, out)
      } else if (typeof nestedValue === "object") {
        collectNumericDetails(nestedValue, out)
      }
    }
  }

  return out
}
