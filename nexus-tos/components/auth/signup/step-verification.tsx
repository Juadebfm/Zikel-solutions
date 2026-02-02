"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/auth/otp-input"

interface StepVerificationProps {
  email: string
  onVerify: (code: string) => Promise<boolean>
  onResend: () => Promise<void>
  onBack: () => void
}

const RESEND_COOLDOWN = 60 // seconds

export function StepVerification({
  email,
  onVerify,
  onResend,
  onBack,
}: StepVerificationProps) {
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

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
      const success = await onVerify(code)
      if (!success) {
        setError("Invalid verification code. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return

    setIsResending(true)
    setError(null)

    try {
      await onResend()
      setCooldown(RESEND_COOLDOWN)
    } catch {
      setError("Failed to resend code. Please try again.")
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
      const success = await onVerify(completedCode)
      if (!success) {
        setError("Invalid verification code. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Verify your email address
          </h1>
          <p className="text-gray-500 mt-2">
            Please enter the OTP sent to{" "}
            <span className="font-medium text-gray-700">{email}</span> to verify
            your email address
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
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
            "Verify your account"
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
              <span>Resend code in {cooldown}s</span>
            ) : (
              <span>Resend code</span>
            )}
          </button>
        </div>
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mt-4 mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>
    </div>
  )
}
