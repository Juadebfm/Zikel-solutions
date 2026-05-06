"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Clock3, Loader2 } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export default function PendingApprovalPage() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()

  const pendingTenantNames = useMemo(() => {
    const memberships = session?.memberships ?? []
    return memberships
      .filter((membership) => membership.status === "pending_approval")
      .map((membership) => membership.tenantName ?? membership.tenantId)
  }, [session?.memberships])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock3 className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approval</h1>
          <p className="text-gray-600 mt-3">
            Your account has been created, but access is pending approval from an organization admin.
          </p>

          {pendingTenantNames.length > 0 ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                Waiting For Approval In
              </p>
              <ul className="space-y-1 text-sm text-amber-900">
                {pendingTenantNames.map((tenantName) => (
                  <li key={tenantName}>• {tenantName}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => router.refresh()}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking status...
                </span>
              ) : (
                "Check status again"
              )}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => void logout()}
            >
              Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
