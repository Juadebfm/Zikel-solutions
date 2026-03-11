const API_PREFIX = "/api/v1"

function normalizeBaseUrl(rawBaseUrl: string | undefined): string {
  const trimmed = rawBaseUrl?.trim()

  if (!trimmed) {
    return API_PREFIX
  }

  const withoutTrailingSlash = trimmed.endsWith("/")
    ? trimmed.slice(0, -1)
    : trimmed

  if (withoutTrailingSlash.endsWith(API_PREFIX)) {
    return withoutTrailingSlash
  }

  return `${withoutTrailingSlash}${API_PREFIX}`
}

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  requestTimeoutMs: 30_000,
}
