import type { ApiErrorPayload } from "@/lib/api/types"

const VALIDATION_ERROR_CODES = new Set([
  "FST_ERR_VALIDATION",
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "REQUEST_FAILED",
])

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: "An account with this email already exists. Log in or reset password.",
  ORG_SLUG_TAKEN: "Organization name is already in use. Try another one.",
  REGISTRATION_CONFLICT: "This signup conflicts with an existing account/org. Please retry or use a different email/org name.",
  OTP_INVALID: "The verification code is invalid or has expired.",
  OTP_COOLDOWN: "Please wait before requesting another code.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_LOCKED: "Your account is temporarily locked. Please try again later.",
  ACCOUNT_INACTIVE: "Your account is inactive. Contact your administrator.",
  EMAIL_NOT_VERIFIED: "Your email is not verified yet. Enter your OTP to continue.",
  REFRESH_TOKEN_INVALID: "Your session has expired. Please sign in again.",
  REFRESH_TOKEN_REUSED: "Your session is no longer valid. Please sign in again.",
  SESSION_IDLE_EXPIRED: "Your session expired due to inactivity. Please sign in again.",
  SESSION_ABSOLUTE_EXPIRED: "Your session has ended. Please sign in again.",
  FST_JWT_AUTHORIZATION_TOKEN_EXPIRED: "Your session is being refreshed. Please try again.",
  TENANT_CONTEXT_REQUIRED: "Select an organization to continue.",
  TENANT_ACCESS_DENIED: "You do not have access to this organization. Switch organization and try again.",
  MFA_REQUIRED: "Additional verification is required to continue.",
  MFA_NOT_REQUIRED: "MFA verification is not required for this action.",
  AI_ACCESS_DISABLED: "AI access is disabled for your account. Contact your administrator.",
  ACTIVATION_INVALID: "Activation details are invalid or expired.",
  ALREADY_ACTIVATED: "This account is already activated. Please sign in.",
  INVITE_LINK_NOT_FOUND: "This invite link is invalid.",
  INVITE_LINK_REVOKED: "This invite link has been revoked.",
  INVITE_LINK_EXPIRED: "This invite link has expired.",
  TENANT_INACTIVE: "This organization is not active.",
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  readonly flyRequestId?: string

  constructor({ status, code, message, details, flyRequestId }: {
    status: number
    code: string
    message: string
    details?: unknown
    flyRequestId?: string
  }) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.code = code
    this.details = details
    this.flyRequestId = flyRequestId
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isApiClientError(error)) {
    const mappedMessage = FRIENDLY_ERROR_MESSAGES[error.code]
    if (mappedMessage) {
      return mappedMessage
    }

    if (error.code === "TENANT_MEMBERSHIP_EXISTS") {
      return "This user is already a member of the organization."
    }

    if (error.code === "TENANT_MEMBERSHIP_FORBIDDEN") {
      return "You do not have permission to manage this membership."
    }

    if (error.code.startsWith("TENANT_INVITE_")) {
      if (error.code === "TENANT_INVITE_EXISTS") {
        return "An invite for this email already exists."
      }

      if (error.code === "TENANT_INVITE_FORBIDDEN") {
        return "You do not have permission to manage invites in this organization."
      }

      if (error.code === "TENANT_INVITE_NOT_FOUND") {
        return "This invite was not found or is no longer available."
      }

      if (error.code === "TENANT_INVITE_ALREADY_ACCEPTED") {
        return "This invite has already been accepted."
      }

      if (error.code === "TENANT_INVITE_REVOKED") {
        return "This invite has been revoked."
      }

      if (error.code === "TENANT_INVITE_EXPIRED") {
        return "This invite has expired."
      }

      if (error.code === "TENANT_INVITE_EMAIL_MISMATCH") {
        return "This invite does not match your account email."
      }
    }

    if (error.status === 404) {
      return "This record was not found or is not accessible in your current tenant."
    }

    if (error.status === 429 || error.code === "RATE_LIMIT_EXCEEDED") {
      const retryAfterSeconds = extractRetryAfterSeconds(error.details)
      if (retryAfterSeconds !== null) {
        return `Too many requests. Try again in ${formatRetryAfterSeconds(retryAfterSeconds)}.`
      }

      return "Too many requests. Please wait and try again."
    }

    if (VALIDATION_ERROR_CODES.has(error.code)) {
      const validationMessage = extractValidationMessage(error.message, error.details)
      if (validationMessage) {
        return validationMessage
      }
    }

    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function toApiClientError(payload: unknown, status: number, statusText: string, flyRequestId?: string): ApiClientError {
  if (isApiFailurePayload(payload)) {
    return new ApiClientError({
      status,
      code: payload.error.code,
      message: payload.error.message,
      details: payload.error.details,
      flyRequestId,
    })
  }

  return new ApiClientError({
    status,
    code: status >= 500 ? "SERVER_ERROR" : "REQUEST_FAILED",
    message: statusText || "Request failed",
    flyRequestId,
  })
}

function isApiFailurePayload(value: unknown): value is { success: false; error: ApiErrorPayload } {
  if (!value || typeof value !== "object") return false

  const maybe = value as Record<string, unknown>
  if (maybe.success !== false) return false

  const error = maybe.error
  if (!error || typeof error !== "object") return false

  const typedError = error as Record<string, unknown>
  return typeof typedError.code === "string" && typeof typedError.message === "string"
}

function extractValidationMessage(message: string, details: unknown): string | null {
  const values = collectStringValues(details)
  for (const value of values) {
    const trimmed = value.trim()
    if (trimmed) {
      return trimmed
    }
  }

  return message.trim() || null
}

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

function extractRetryAfterSeconds(details: unknown): number | null {
  const values = collectNumericValues(details)

  for (const value of values) {
    if (Number.isFinite(value) && value > 0) {
      return Math.ceil(value)
    }
  }

  return null
}

function collectNumericValues(value: unknown, out: number[] = []): number[] {
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
      collectNumericValues(item, out)
    }
    return out
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    for (const [key, nestedValue] of Object.entries(record)) {
      if (/retry|cooldown|wait|after|reset/i.test(key)) {
        collectNumericValues(nestedValue, out)
      } else if (typeof nestedValue === "object") {
        collectNumericValues(nestedValue, out)
      }
    }
  }

  return out
}

function formatRetryAfterSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.ceil(seconds / 60)
  return `${minutes}m`
}
