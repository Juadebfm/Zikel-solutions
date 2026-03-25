import type { OtpDeliveryStatus } from "@/services/auth.service"
import { getApiErrorMessage, isApiClientError } from "@/lib/api/error"

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

const VALIDATION_ERROR_CODES = new Set([
  "FST_ERR_VALIDATION",
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "REQUEST_FAILED",
])

function collectStringValues(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value)
    return out
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringValues(item, out)
    }
    return out
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      collectStringValues(nestedValue, out)
    }
  }

  return out
}

function mapPasswordValidationMessage(raw: string): string | null {
  const message = raw.toLowerCase()

  if (!message.includes("password")) {
    return null
  }

  if (
    /fewer than\s*12|at least\s*12|min(?:imum)?\s*(?:length|characters)?.*12|min\.\s*12/.test(
      message
    )
  ) {
    return "Password must be at least 12 characters."
  }

  if (message.includes("uppercase")) {
    return "Password must contain an uppercase letter."
  }

  if (message.includes("lowercase")) {
    return "Password must contain a lowercase letter."
  }

  if (message.includes("number") || message.includes("digit")) {
    return "Password must contain a number."
  }

  if (message.includes("special")) {
    return "Password must contain a special character."
  }

  if (message.includes("space") || message.includes("whitespace")) {
    return "Password must not contain spaces."
  }

  return null
}

function getFriendlyValidationMessage(message: string, details: unknown): string | null {
  const candidates = [message, ...collectStringValues(details)]

  for (const candidate of candidates) {
    const mapped = mapPasswordValidationMessage(candidate)
    if (mapped) {
      return mapped
    }
  }

  return null
}

export function getCooldownSecondsFromError(error: unknown): number {
  if (!isApiClientError(error)) {
    return 0
  }

  if (error.status !== 429 && error.code !== "RATE_LIMIT_EXCEEDED") {
    return 0
  }

  if (!error.details || typeof error.details !== "object") {
    return 30
  }

  const details = error.details as Record<string, unknown>
  const candidates = [
    details.retryAfter,
    details.retryAfterSeconds,
    details.cooldown,
    details.waitSeconds,
    details.resetIn,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
      return Math.ceil(candidate)
    }
    if (typeof candidate === "string") {
      const parsed = Number.parseFloat(candidate)
      if (Number.isFinite(parsed) && parsed > 0) {
        return Math.ceil(parsed)
      }
    }
  }

  return 30
}

export function getPublicAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isApiClientError(error)) {
    if (VALIDATION_ERROR_CODES.has(error.code)) {
      const friendlyValidationMessage = getFriendlyValidationMessage(error.message, error.details)
      if (friendlyValidationMessage) {
        return friendlyValidationMessage
      }
    }

    return getApiErrorMessage(error, fallback)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
