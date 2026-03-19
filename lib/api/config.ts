const API_PREFIX = "/api/v1"
const DEFAULT_BACKEND_ORIGIN = "https://zikel-solutions-be.onrender.com"

function normalizeBaseUrl(rawBaseUrl: string | undefined): string {
  const trimmed = rawBaseUrl?.trim()

  if (!trimmed) {
    return `${DEFAULT_BACKEND_ORIGIN}${API_PREFIX}`
  }

  const withoutTrailingSlash = trimmed.endsWith("/")
    ? trimmed.slice(0, -1)
    : trimmed

  // Prevent accidental same-origin calls in production when a relative path is provided.
  if (withoutTrailingSlash.startsWith("/")) {
    return `${DEFAULT_BACKEND_ORIGIN}${API_PREFIX}`
  }

  if (withoutTrailingSlash.endsWith(API_PREFIX)) {
    return withoutTrailingSlash
  }

  return `${withoutTrailingSlash}${API_PREFIX}`
}

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  requestTimeoutMs: 90_000,
}
