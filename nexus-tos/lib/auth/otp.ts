import type { OtpDeliveryStatus } from "@/services/auth.service"

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
