"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, MailCheck } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"
import { useAcceptTenantInvite } from "@/hooks/api/use-tenants"
import { getApiErrorMessage } from "@/lib/api/error"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session, switchTenant } = useAuth()
  const acceptInviteMutation = useAcceptTenantInvite()

  const [tokenInput, setTokenInput] = useState(() => searchParams.get("token") ?? "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    if (error) {
      showError(error)
      setError(null)
    }
  }, [error, showError])

  const handleAcceptInvite = async () => {
    const token = tokenInput.trim()
    if (!token) {
      setError("Invite token is required.")
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const payload = await acceptInviteMutation.mutateAsync(token)
      setSuccess(payload.message || "Invite accepted.")

      if (payload.tenantId && payload.tenantId !== session?.activeTenantId) {
        await switchTenant(payload.tenantId)
      }
    } catch (acceptError) {
      setError(getApiErrorMessage(acceptError, "Unable to accept invite."))
    }
  }

  const isSubmitting = acceptInviteMutation.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accept Invite</h1>
        <p className="text-gray-500 mt-1">
          Accept a tenant invite token to join your team workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="h-5 w-5 text-primary" />
            Tenant Invite
          </CardTitle>
          <CardDescription>
            Paste your invite token or open this page with `?token=...` from the invite email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-token">Invite token</Label>
            <Input
              id="invite-token"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Paste invite token"
            />
          </div>

          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => void handleAcceptInvite()}
              className="gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Accept Invite
            </Button>
            <Button variant="outline" onClick={() => router.push("/users")}>
              Back to Users
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/my-summary">Go to Summary</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
