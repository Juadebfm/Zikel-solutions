import { isApiClientError } from "@/lib/api/error"

/**
 * Logs API errors with error.code and request-id for support/debug tracing.
 * Call this in catch blocks where you want visibility into failed API calls.
 */
export function logApiError(error: unknown, context?: string): void {
  if (!isApiClientError(error)) {
    if (error instanceof Error) {
      console.error(`[api${context ? `:${context}` : ""}]`, error.message)
    }
    return
  }

  const parts: string[] = [
    `code=${error.code}`,
    `status=${error.status}`,
  ]

  if (error.requestId) {
    parts.push(`request-id=${error.requestId}`)
  }

  if (error.message) {
    parts.push(`msg=${error.message}`)
  }

  console.error(`[api${context ? `:${context}` : ""}]`, parts.join(" | "))
}
