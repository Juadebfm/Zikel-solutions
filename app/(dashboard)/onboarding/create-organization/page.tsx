"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useCreateSelfServeTenant } from "@/hooks/api/use-tenants"
import { getApiErrorMessage } from "@/lib/api/error"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateOrganizationPage() {
  const router = useRouter()
  const { session, switchTenant } = useAuth()
  const createSelfServeTenantMutation = useCreateSelfServeTenant()

  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateOrganization = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Organization name is required.")
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const payload = await createSelfServeTenantMutation.mutateAsync({
        name: trimmedName,
      })

      setSuccess(payload.message || "Organization created successfully.")

      const fallbackTenantId =
        session?.memberships.find((membership) => membership.isActive)?.tenantId ??
        session?.memberships[0]?.tenantId ??
        null
      const tenantId = payload.tenantId ?? fallbackTenantId

      if (!tenantId) {
        return
      }

      const switchResult = await switchTenant(tenantId)
      if (!switchResult.success) {
        setError(switchResult.message ?? "Organization created, but we could not activate the tenant.")
        return
      }

      router.push("/my-summary")
    } catch (createError) {
      setError(getApiErrorMessage(createError, "Unable to create organization. Please try again."))
    }
  }

  const isSubmitting = createSelfServeTenantMutation.isPending

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Organization</h1>
        <p className="mt-1 text-gray-500">
          Create your first organization to activate tenant-scoped workspace access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Organization Setup
          </CardTitle>
          <CardDescription>
            This creates your initial tenant and links it to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="organization-name">Organization name</Label>
            <Input
              id="organization-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter organization name"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Button onClick={() => void handleCreateOrganization()} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push("/my-summary")}>
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
