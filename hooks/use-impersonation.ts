"use client"

import { useMemo } from "react"

import { useAuthSessionStore } from "@/stores/auth-session-store"
import { decodeAccessToken, isImpersonating as jwtIsImpersonating } from "@/lib/auth/jwt"

/**
 * Returns `true` when the current session is a platform-staff impersonation
 * of a tenant user (JWT carries `impersonatorId`). Use this to preempt 409
 * `IMPERSONATION_ACTIVE` from self-mutating account flows (change password,
 * disable MFA) so support staff don't accidentally invoke them.
 *
 * Server still enforces — this hook is only for hiding / disabling UI.
 */
export function useIsImpersonating(): boolean {
  const accessToken = useAuthSessionStore((s) => s.accessToken)
  return useMemo(() => jwtIsImpersonating(decodeAccessToken(accessToken)), [accessToken])
}
