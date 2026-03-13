import type { OtpDeliveryStatus } from "@/services/auth.service"
import { isApiClientError } from "@/lib/api/error"

export function getOtpDeliveryStatusMessage(status: OtpDeliveryStatus): string {
  if (status === "sent") {
    return "Code sent. Check your email."
  }

  if (status === "queued") {
    return "Account created. We're sending your code now."
  }

  return "Account created, but code wasn't sent. Tap Resend."
}

export function getResendCooldownSeconds(resendAvailableAt?: string | null): number {
  if (!resendAvailableAt) {
    return 0
  }

  const resendTimestamp = Date.parse(resendAvailableAt)
  if (Number.isNaN(resendTimestamp)) {
    return 0
  }

  return Math.max(0, Math.ceil((resendTimestamp - Date.now()) / 1000))
}

const PUBLIC_AUTH_ERROR_MESSAGES: Record<string, string> = {
  CAPTCHA_REQUIRED: "Please complete the security verification.",
  CAPTCHA_INVALID: "Security verification expired. Please try again.",
  CAPTCHA_NOT_CONFIGURED: "Security verification is unavailable right now. Please try again shortly.",
}

export function getPublicAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isApiClientError(error)) {
    if (PUBLIC_AUTH_ERROR_MESSAGES[error.code]) {
      return PUBLIC_AUTH_ERROR_MESSAGES[error.code]
    }

    return error.message || fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
