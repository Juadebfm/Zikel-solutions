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
  retryOnMfaRequired?: boolean
  requestId?: string
}

interface RefreshPayload {
  user?: unknown
  session?: unknown
  tokens: {
    accessToken: string
    refreshToken?: string
  }
}

let refreshPromise: Promise<string | null> | null = null
let pendingMfaRequest: ApiRequestOptions | null = null

const MFA_RETURN_PATH_STORAGE_KEY = "nexus-mfa-return-path"

export async function apiRequest<T, M = unknown>(
  options: ApiRequestOptions
): Promise<ApiSuccess<T, M>> {
  const response = await executeRequest<T, M>(options)

  if (!response.ok) {
    const errorPayload = await parseJsonSafely(response)
    if (options.auth) {
      syncMfaRequirementFromError(errorPayload)
    }
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

export async function retryPendingMfaRequest(): Promise<boolean> {
  if (!pendingMfaRequest) {
    return false
  }

  const request = pendingMfaRequest
  pendingMfaRequest = null

  try {
    const response = await executeRequest({
      ...request,
      retryOnMfaRequired: false,
    })
    return response.ok
  } catch {
    return false
  }
}

export function clearPendingMfaRequest(): void {
  pendingMfaRequest = null
}

export function consumeMfaReturnPath(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.sessionStorage.getItem(MFA_RETURN_PATH_STORAGE_KEY)
  if (value) {
    window.sessionStorage.removeItem(MFA_RETURN_PATH_STORAGE_KEY)
  }

  return value
}

async function executeRequest<T, M>(
  options: ApiRequestOptions
): Promise<Response> {
  const {
    auth = false,
    retryOnUnauthorized = true,
    retryOnMfaRequired = true,
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

  if (auth && response.status === 403 && retryOnMfaRequired) {
    const payload = await parseJsonSafely(response.clone())
    storePendingMfaRequest(options, payload)
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
      let { response, payload } = await requestRefreshTokenResponse({
        refreshToken: session.refreshToken,
      })

      if (
        !response.ok &&
        shouldRetryRefreshWithLegacyTokenBody(response.status, payload)
      ) {
        const legacyAttempt = await requestRefreshTokenResponse({
          token: session.refreshToken,
        })
        response = legacyAttempt.response
        payload = legacyAttempt.payload
      }

      if (!response.ok) {
        if (
          isApiFailurePayload(payload) &&
          payload.error.code === "REFRESH_TOKEN_INVALID"
        ) {
          session.clearSession()
        }
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

      if (isAuthSessionPayload(payload.data?.session)) {
        session.setSessionContext({
          activeTenantId: payload.data.session.activeTenantId,
          activeTenantRole: payload.data.session.activeTenantRole,
          memberships: payload.data.session.memberships.map((membership) => ({
            id: membership.id,
            tenantId: membership.tenantId,
            tenantRole: membership.tenantRole,
            isActive: membership.isActive,
            tenantName: membership.tenantName,
            tenantSlug: membership.tenantSlug,
            status: membership.status,
          })),
          mfaRequired: payload.data.session.mfaRequired,
          mfaVerified: payload.data.session.mfaVerified,
        })
      }

      return tokens.accessToken
    } catch {
      return null
    }
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function requestRefreshTokenResponse(body: {
  refreshToken?: string
  token?: string
}): Promise<{ response: Response; payload: unknown }> {
  const response = await fetchWithTimeout(buildRequestUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const payload = await parseJsonSafely(response)
  return { response, payload }
}

function shouldRetryRefreshWithLegacyTokenBody(
  status: number,
  payload: unknown
): boolean {
  if (status !== 400 && status !== 422) {
    return false
  }

  if (!isApiFailurePayload(payload)) {
    return true
  }

  const code = payload.error.code.toUpperCase()
  return (
    code === "FST_ERR_VALIDATION" ||
    code === "VALIDATION_ERROR" ||
    code === "BAD_REQUEST" ||
    code === "REQUEST_FAILED" ||
    code.includes("VALIDATION")
  )
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

function syncMfaRequirementFromError(errorPayload: unknown): void {
  if (!isApiFailurePayload(errorPayload)) {
    return
  }

  if (errorPayload.error.code !== "MFA_REQUIRED") {
    return
  }

  const session = getAuthSessionState()
  if (!session.session) {
    return
  }

  session.setSessionContext({
    ...session.session,
    mfaRequired: true,
    mfaVerified: false,
  })
}

function storePendingMfaRequest(options: ApiRequestOptions, errorPayload: unknown): void {
  if (!options.auth || options.retryOnMfaRequired === false) {
    return
  }

  if (!isApiFailurePayload(errorPayload) || errorPayload.error.code !== "MFA_REQUIRED") {
    return
  }

  pendingMfaRequest = {
    ...options,
    retryOnMfaRequired: false,
  }

  if (typeof window !== "undefined") {
    const path = `${window.location.pathname}${window.location.search}`
    if (path && !path.startsWith("/mfa-verify")) {
      window.sessionStorage.setItem(MFA_RETURN_PATH_STORAGE_KEY, path)
    }
  }
}

interface SessionMembershipPayload {
  id: string
  tenantId: string
  tenantRole: "tenant_admin" | "sub_admin" | "staff"
  isActive: boolean
  tenantName?: string
  tenantSlug?: string
  status?: "active" | "invited" | "pending_approval" | "suspended" | "revoked"
}

interface SessionPayload {
  activeTenantId: string | null
  activeTenantRole: "tenant_admin" | "sub_admin" | "staff" | null
  memberships: SessionMembershipPayload[]
  mfaRequired: boolean
  mfaVerified: boolean
}

function isSessionMembershipPayload(value: unknown): value is SessionMembershipPayload {
  if (!value || typeof value !== "object") return false
  const membership = value as Record<string, unknown>

  return (
    typeof membership.id === "string" &&
    typeof membership.tenantId === "string" &&
    (membership.tenantRole === "tenant_admin" ||
      membership.tenantRole === "sub_admin" ||
      membership.tenantRole === "staff") &&
    typeof membership.isActive === "boolean" &&
    (membership.tenantName === undefined || typeof membership.tenantName === "string") &&
    (membership.tenantSlug === undefined || typeof membership.tenantSlug === "string") &&
    (membership.status === undefined ||
      membership.status === "active" ||
      membership.status === "invited" ||
      membership.status === "pending_approval" ||
      membership.status === "suspended" ||
      membership.status === "revoked")
  )
}

function isAuthSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== "object") return false
  const session = value as Record<string, unknown>

  if (!(session.activeTenantId === null || typeof session.activeTenantId === "string")) return false
  if (
    !(
      session.activeTenantRole === null ||
      session.activeTenantRole === "tenant_admin" ||
      session.activeTenantRole === "sub_admin" ||
      session.activeTenantRole === "staff"
    )
  ) return false
  if (!Array.isArray(session.memberships) || !session.memberships.every(isSessionMembershipPayload)) return false
  if (typeof session.mfaRequired !== "boolean") return false
  if (typeof session.mfaVerified !== "boolean") return false

  return true
}
