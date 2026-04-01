"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

function parseIso(value: string | null): number | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return null
  return timestamp
}

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "00:00"

  const totalSeconds = Math.floor(msRemaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function SessionExpiryBanner() {
  const {
    sessionExpiry,
    serverTimeOffsetMs,
    staySignedIn,
  } = useAuth()

  const [nowClientMs, setNowClientMs] = useState(() => Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowClientMs(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const nowServerMs = nowClientMs + serverTimeOffsetMs
  const idleExpiresAtMs = parseIso(sessionExpiry.idleExpiresAt)
  const absoluteExpiresAtMs = parseIso(sessionExpiry.absoluteExpiresAt)
  const warningWindowMs = Math.max(sessionExpiry.warningWindowSeconds, 0) * 1000

  const signOutAtMs = useMemo(() => {
    if (idleExpiresAtMs === null && absoluteExpiresAtMs === null) return null
    if (idleExpiresAtMs === null) return absoluteExpiresAtMs
    if (absoluteExpiresAtMs === null) return idleExpiresAtMs
    return Math.min(idleExpiresAtMs, absoluteExpiresAtMs)
  }, [absoluteExpiresAtMs, idleExpiresAtMs])

  const shouldShow = useMemo(() => {
    if (signOutAtMs === null) return false
    return nowServerMs >= signOutAtMs - warningWindowMs
  }, [nowServerMs, signOutAtMs, warningWindowMs])

  if (!shouldShow || signOutAtMs === null) {
    return null
  }

  const msRemaining = Math.max(signOutAtMs - nowServerMs, 0)
  const countdown = formatCountdown(msRemaining)

  const handleStaySignedIn = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await staySignedIn()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-amber-900">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            You will be signed out in <span className="font-semibold tabular-nums">{countdown}</span>.
          </span>
        </div>

        <Button
          size="sm"
          className="bg-amber-600 text-white hover:bg-amber-700"
          onClick={handleStaySignedIn}
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Stay signed in
        </Button>
      </div>
    </div>
  )
}
