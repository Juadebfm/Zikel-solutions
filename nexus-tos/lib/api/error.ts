import type { ApiErrorPayload } from "@/lib/api/types"

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor({ status, code, message, details }: { status: number; code: string; message: string; details?: unknown }) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isApiClientError(error)) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function toApiClientError(payload: unknown, status: number, statusText: string): ApiClientError {
  if (isApiFailurePayload(payload)) {
    return new ApiClientError({
      status,
      code: payload.error.code,
      message: payload.error.message,
      details: payload.error.details,
    })
  }

  return new ApiClientError({
    status,
    code: status >= 500 ? "SERVER_ERROR" : "REQUEST_FAILED",
    message: statusText || "Request failed",
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
