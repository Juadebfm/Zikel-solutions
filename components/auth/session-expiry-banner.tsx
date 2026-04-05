"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, LogOut, ShieldAlert } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    logout,
  } = useAuth()

  const [nowClientMs, setNowClientMs] = useState(() => Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const hasTriggeredAutoLogout = useRef(false)

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

  useEffect(() => {
    if (!shouldShow || signOutAtMs === null) {
      hasTriggeredAutoLogout.current = false
      return
    }

    const msRemaining = signOutAtMs - nowServerMs
    if (msRemaining <= 0 && !hasTriggeredAutoLogout.current) {
      hasTriggeredAutoLogout.current = true
      void logout()
    }
  }, [logout, nowServerMs, shouldShow, signOutAtMs])

  if (!shouldShow || signOutAtMs === null) {
    return null
  }

  const msRemaining = Math.max(signOutAtMs - nowServerMs, 0)
  const countdown = formatCountdown(msRemaining)
  const isExpired = msRemaining <= 0

  const handleStaySignedIn = async () => {
    if (isRefreshing || isExpired) return
    setIsRefreshing(true)
    try {
      await staySignedIn()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSignOutNow = () => {
    if (isRefreshing) return
    hasTriggeredAutoLogout.current = true
    void logout()
  }

  return (
    <Dialog open={shouldShow} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <ShieldAlert className="h-6 w-6 text-amber-700" />
          </div>
          <DialogTitle className="text-center">Session Expiring</DialogTitle>
          <DialogDescription className="text-center">
            {isExpired
              ? "Your session has expired. Signing you out now."
              : (
                <>
                  You will be signed out in{" "}
                  <span className="font-semibold tabular-nums text-foreground">{countdown}</span>.
                </>
              )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleSignOutNow}
            disabled={isRefreshing}
          >
            <LogOut className="h-4 w-4" />
            Sign out now
          </Button>
          <Button
            type="button"
            className="bg-amber-600 text-white hover:bg-amber-700"
            onClick={handleStaySignedIn}
            disabled={isRefreshing || isExpired}
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Stay signed in
          </Button>
        </DialogFooter>

        {isExpired ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to sign in...
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
