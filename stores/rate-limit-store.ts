import { create } from "zustand"

/**
 * Global cool-down store for 429 RATE_LIMIT_EXCEEDED responses.
 *
 * Keys are "route families" — typically the first path segment of an API
 * route (`/auth/login` → `auth`, `/billing/checkout-session` → `billing`,
 * `/ai/conversations/x/messages` → `ai`).
 *
 * The API client writes here when it observes a 429 with `x-ratelimit-reset`
 * (primary) or `retry-after` (HTTP-standard fallback). Per BE confirmation
 * 2026-05-12, both headers are always sent together with the same value.
 * Consumers (forms, AI composers) read via `useCooldown(family)` and disable
 * submit buttons until the timestamp passes.
 */

interface RateLimitState {
  /** Map of route family → unix millis when the bucket refills. */
  cooldownsByFamily: Record<string, number>
  setCooldown: (family: string, resetMs: number) => void
  clearCooldown: (family: string) => void
}

export const useRateLimitStore = create<RateLimitState>()((set) => ({
  cooldownsByFamily: {},
  setCooldown: (family, resetMs) =>
    set((state) => ({
      cooldownsByFamily: { ...state.cooldownsByFamily, [family]: resetMs },
    })),
  clearCooldown: (family) =>
    set((state) => {
      const next = { ...state.cooldownsByFamily }
      delete next[family]
      return { cooldownsByFamily: next }
    }),
}))

/**
 * Imperative API for the API client interceptor (which lives outside React).
 */
export function recordRateLimitHit(family: string, resetSeconds: number) {
  const resetMs = Date.now() + Math.max(0, resetSeconds) * 1000
  useRateLimitStore.getState().setCooldown(family, resetMs)
}

/**
 * Derive the "route family" key from a path. Strips leading slash, returns
 * the first segment. `/auth/login` → `auth`, `/billing/checkout-session` →
 * `billing`. Falls back to `default` for unrecognised paths.
 */
export function routeFamilyFromPath(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path
  const first = normalized.split("/")[0]?.trim() ?? ""
  return first || "default"
}
