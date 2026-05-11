"use client"

import { useMemo } from "react"
import { LifeBuoy, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useAuthSessionStore } from "@/stores/auth-session-store"
import { decodeAccessToken, isImpersonating } from "@/lib/auth/jwt"

export function ImpersonationBanner() {
  const { user, logout } = useAuth()
  const accessToken = useAuthSessionStore((s) => s.accessToken)

  const payload = useMemo(() => decodeAccessToken(accessToken), [accessToken])
  const impersonationActive = isImpersonating(payload)

  if (!impersonationActive) return null

  const targetName = user ? `${user.firstName} ${user.lastName}`.trim() : "this user"

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-col gap-2 border-b border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-900 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex items-start gap-2 sm:items-center">
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-yellow-700 sm:mt-0" aria-hidden="true" />
        <p>
          <span className="font-semibold">Support session active</span> · acting as{" "}
          <span className="font-medium">{targetName}</span>. All changes are logged.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-end border-yellow-400 text-yellow-900 hover:bg-yellow-100 sm:self-auto"
        onClick={() => void logout()}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        End session
      </Button>
    </div>
  )
}
