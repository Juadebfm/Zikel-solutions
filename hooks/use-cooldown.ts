"use client"

import { useSyncExternalStore } from "react"

import { useRateLimitStore } from "@/stores/rate-limit-store"

function readRemaining(family: string | null | undefined): number {
  if (typeof window === "undefined" || !family) return 0
  const resetMs = useRateLimitStore.getState().cooldownsByFamily[family]
  if (!resetMs) return 0
  return Math.max(0, Math.ceil((resetMs - Date.now()) / 1000))
}

function subscribe(family: string | null | undefined, onChange: () => void): () => void {
  if (typeof window === "undefined" || !family) return () => undefined
  const tick = window.setInterval(onChange, 1000)
  const unsub = useRateLimitStore.subscribe(onChange)
  return () => {
    window.clearInterval(tick)
    unsub()
  }
}

/**
 * Reads the rate-limit cool-down for a given route family. Returns `isActive`
 * and the remaining seconds until the bucket refills. Auto-ticks every second
 * via `useSyncExternalStore`. Pass `null` to opt out (returns inactive).
 *
 * Use the same family key the API client derives from the route path —
 * typically the first segment, e.g. `"ai"`, `"auth"`, `"billing"`.
 */
export function useCooldown(family: string | null | undefined): {
  isActive: boolean
  secondsRemaining: number
} {
  const secondsRemaining = useSyncExternalStore(
    (cb) => subscribe(family, cb),
    () => readRemaining(family),
    () => 0,
  )

  // Auto-clear stale entries once they expire (housekeeping).
  if (secondsRemaining === 0 && family && typeof window !== "undefined") {
    const current = useRateLimitStore.getState().cooldownsByFamily[family]
    if (current && current <= Date.now()) {
      useRateLimitStore.getState().clearCooldown(family)
    }
  }

  return {
    isActive: secondsRemaining > 0,
    secondsRemaining,
  }
}
