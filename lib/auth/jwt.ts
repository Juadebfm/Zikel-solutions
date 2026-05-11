/**
 * Lightweight JWT decoder.
 *
 * NOTE: This DOES NOT verify the signature. It only reads the payload for
 * UI hints (impersonation banner, session warnings, etc). Every server
 * route re-validates the token, so this client-side read is purely for UX.
 */

export interface TenantJwtPayload {
  sub: string
  email?: string
  role?: "staff" | "manager" | "admin" | "super_admin"
  tenantId?: string | null
  tenantRole?: "tenant_admin" | "sub_admin" | "staff" | null
  mfaVerified?: boolean
  sessionId?: string
  /** Present when a platform-staff member is acting as this user. */
  impersonatorId?: string
  /** Grant id, used to end the impersonation session. */
  impersonationGrantId?: string
  aud?: string | string[]
  iat?: number
  exp?: number
}

function decodeBase64Url(value: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("Empty JWT segment")
  }

  // base64url → base64
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))

  if (typeof globalThis.atob === "function") {
    const binary = globalThis.atob(padded + padding)
    let utf8 = ""
    for (let i = 0; i < binary.length; i += 1) {
      const code = binary.charCodeAt(i)
      utf8 += `%${code.toString(16).padStart(2, "0")}`
    }
    try {
      return decodeURIComponent(utf8)
    } catch {
      return binary
    }
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded + padding, "base64").toString("utf-8")
  }

  throw new Error("No base64 decoder available")
}

/**
 * Decode (but do NOT verify) the payload of a JWT. Returns null on
 * malformed input.
 */
export function decodeAccessToken(token: string | null | undefined): TenantJwtPayload | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    const payloadJson = decodeBase64Url(parts[1])
    const payload = JSON.parse(payloadJson) as unknown
    if (!payload || typeof payload !== "object") return null
    return payload as TenantJwtPayload
  } catch {
    return null
  }
}

export function isImpersonating(payload: TenantJwtPayload | null | undefined): boolean {
  return Boolean(payload?.impersonatorId)
}
