import { API_CONFIG } from "@/lib/api/config"
import { ApiClientError, toApiClientError } from "@/lib/api/error"
import type { ApiResponse, ApiSuccess } from "@/lib/api/types"
import { getAuthSessionState } from "@/stores/auth-session-store"

interface QueryParams {
  [key: string]: string | number | boolean | null | undefined
}

interface ApiRequestOptions {
  path: string
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  query?: QueryParams
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
  retryOnUnauthorized?: boolean
  requestId?: string
}

interface RefreshPayload {
  user: unknown
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

let refreshPromise: Promise<string | null> | null = null

export async function apiRequest<T, M = unknown>(
  options: ApiRequestOptions
): Promise<ApiSuccess<T, M>> {
  const response = await executeRequest<T, M>(options)

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response)
    throw toApiClientError(errorPayload, response.status, response.statusText)
  }

  const payload = await parseJsonSafely(response)

  if (isApiSuccessPayload<T, M>(payload)) {
    return payload
  }

  if (isApiFailurePayload(payload)) {
    throw new ApiClientError({
      status: response.status,
      code: payload.error.code,
      message: payload.error.message,
      details: payload.error.details,
    })
  }

  throw new ApiClientError({
    status: response.status,
    code: "INVALID_RESPONSE",
    message: "Unexpected response format from server",
  })
}

async function executeRequest<T, M>(
  options: ApiRequestOptions
): Promise<Response> {
  const {
    auth = false,
    retryOnUnauthorized = true,
  } = options

  const session = getAuthSessionState()
  const accessToken = auth ? session.accessToken : null

  const response = await fetchWithTimeout(
    buildRequestUrl(options.path, options.query),
    {
      method: options.method ?? "GET",
      headers: buildRequestHeaders(options, accessToken),
      body: serializeRequestBody(options.body),
    }
  )

  if (auth && response.status === 401 && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken()

    if (!refreshedToken) {
      const payload = await parseJsonSafely(response)
      throw toApiClientError(payload, response.status, response.statusText)
    }

    return executeRequest<T, M>({
      ...options,
      retryOnUnauthorized: false,
    })
  }

  return response
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const session = getAuthSessionState()

    if (!session.refreshToken) {
      session.clearSession()
      return null
    }

    try {
      const response = await fetchWithTimeout(buildRequestUrl("/auth/refresh"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      })

      const payload = await parseJsonSafely(response)

      if (!response.ok) {
        session.clearSession()
        return null
      }

      if (!isApiSuccessPayload<RefreshPayload, unknown>(payload)) {
        session.clearSession()
        return null
      }

      const tokens = payload.data?.tokens

      if (!tokens?.accessToken || !tokens.refreshToken) {
        session.clearSession()
        return null
      }

      session.setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })

      return tokens.accessToken
    } catch {
      session.clearSession()
      return null
    }
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

function buildRequestHeaders(
  options: ApiRequestOptions,
  accessToken: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }

  if (options.auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (options.requestId) {
    headers["x-request-id"] = options.requestId
  }

  return headers
}

function serializeRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined
  }

  if (body instanceof FormData) {
    return body
  }

  return JSON.stringify(body)
}

function buildRequestUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const baseUrl = API_CONFIG.baseUrl.endsWith("/")
    ? API_CONFIG.baseUrl.slice(0, -1)
    : API_CONFIG.baseUrl

  const url = `${baseUrl}${normalizedPath}`

  if (!query) {
    return url
  }

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort("timeout"), API_CONFIG.requestTimeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (isAbortError(error)) {
      const reason = controller.signal.reason
      const isTimeout = reason === "timeout"

      throw new ApiClientError({
        status: isTimeout ? 408 : 499,
        code: isTimeout ? "REQUEST_TIMEOUT" : "REQUEST_ABORTED",
        message: isTimeout
          ? "The request timed out. Please try again."
          : "The request was cancelled. Please try again.",
        details:
          typeof reason === "string" && reason && reason !== "timeout"
            ? { reason }
            : undefined,
      })
    }

    if (error instanceof TypeError) {
      throw new ApiClientError({
        status: 0,
        code: "NETWORK_ERROR",
        message: "Unable to reach the server. Check your connection and try again.",
      })
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isApiSuccessPayload<T, M>(value: unknown): value is ApiSuccess<T, M> {
  if (!value || typeof value !== "object") return false

  const maybe = value as Record<string, unknown>
  return maybe.success === true && "data" in maybe
}

function isApiFailurePayload(value: unknown): value is Extract<ApiResponse<unknown>, { success: false }> {
  if (!value || typeof value !== "object") return false

  const maybe = value as Record<string, unknown>
  if (maybe.success !== false) return false

  const error = maybe.error
  if (!error || typeof error !== "object") return false

  const typedError = error as Record<string, unknown>
  return typeof typedError.code === "string" && typeof typedError.message === "string"
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}
