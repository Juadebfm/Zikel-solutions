"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, Loader2, MailPlus, RotateCcw, UserCog, UserPlus } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { useCreateTenantInvite, useRevokeTenantInvite, useTenantInvites } from "@/hooks/api/use-tenants"
import { getApiErrorMessage } from "@/lib/api/error"
import { canManageInvites, getAllowedInviteRoles } from "@/lib/auth/rbac"
import type { TenantRole } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const INVITE_ROLE_LABELS: Record<TenantRole, string> = {
  tenant_admin: "Tenant Admin",
  sub_admin: "Sub Admin",
  staff: "Staff",
}

function getInviteStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "accepted":
      return "default"
    case "revoked":
    case "expired":
      return "secondary"
    default:
      return "outline"
  }
}

function canRevokeInvite(status: string): boolean {
  return status === "pending" || status === "queued" || status === "sent"
}

export default function UsersPage() {
  const { user, session } = useAuth()
  const activeTenantId = session?.activeTenantId ?? null
  const activeTenantRole = session?.activeTenantRole ?? null
  const canManageTenantInvites = canManageInvites(user?.role, activeTenantRole)
  const allowedInviteRoles = useMemo(
    () => getAllowedInviteRoles(user?.role, activeTenantRole),
    [activeTenantRole, user?.role]
  )

  const invitesQuery = useTenantInvites(activeTenantId, {
    page: 1,
    limit: 100,
  })
  const createInviteMutation = useCreateTenantInvite(activeTenantId)
  const revokeInviteMutation = useRevokeTenantInvite(activeTenantId)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TenantRole>("staff")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "revoked" | "expired">("all")
  const [search, setSearch] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [fallbackInviteValue, setFallbackInviteValue] = useState<string | null>(null)
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null)

  useEffect(() => {
    if (allowedInviteRoles.length > 0) {
      setInviteRole(allowedInviteRoles[0])
    }
  }, [allowedInviteRoles])

  const filteredRows = useMemo(() => {
    const inviteRows = invitesQuery.data?.items ?? []
    const query = search.trim().toLowerCase()

    return inviteRows.filter((invite) => {
      if (statusFilter !== "all" && invite.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return (
        invite.email.toLowerCase().includes(query) ||
        invite.role.toLowerCase().includes(query) ||
        invite.status.toLowerCase().includes(query)
      )
    })
  }, [invitesQuery.data?.items, search, statusFilter])

  const handleCreateInvite = async () => {
    if (!activeTenantId) {
      setFormError("Select an active tenant before creating invites.")
      return
    }

    if (!canManageTenantInvites) {
      setFormError("You do not have permission to create invites in this tenant.")
      return
    }

    if (!inviteEmail.trim()) {
      setFormError("Invite email is required.")
      return
    }

    setFormError(null)
    setFormSuccess(null)
    setFallbackInviteValue(null)

    try {
      const payload = await createInviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      })

      setInviteEmail("")
      setFormSuccess(payload.message || "Invite created.")

      if (payload.inviteLink) {
        setFallbackInviteValue(payload.inviteLink)
      } else if (payload.token) {
        setFallbackInviteValue(payload.token)
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create invite."))
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    if (!activeTenantId) {
      return
    }

    setRevokingInviteId(inviteId)
    setFormError(null)
    setFormSuccess(null)

    try {
      const payload = await revokeInviteMutation.mutateAsync(inviteId)
      setFormSuccess(payload.message || "Invite revoked.")
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to revoke invite."))
    } finally {
      setRevokingInviteId(null)
    }
  }

  const handleCopyFallback = async () => {
    if (!fallbackInviteValue || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(fallbackInviteValue)
      setFormSuccess("Invite fallback copied.")
    } catch {
      setFormError("Unable to copy invite fallback value.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">
          Manage tenant invites and onboarding access.
        </p>
      </div>

      {!activeTenantId ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <UserCog className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                No active tenant selected.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Switch to a tenant from the profile menu, then manage invites here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTenantId && canManageTenantInvites ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Invite</CardTitle>
            <CardDescription>
              Invite a user to this tenant. Email delivery is best-effort; copy token/link fallback when provided.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="staff@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TenantRole)}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedInviteRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {INVITE_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => void handleCreateInvite()}
                  className="w-full gap-2"
                  disabled={createInviteMutation.isPending}
                >
                  {createInviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Send Invite
                </Button>
              </div>
            </div>

            {fallbackInviteValue ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800 mb-2">
                  Email may be delayed. Use this fallback token/link:
                </p>
                <div className="flex gap-2">
                  <Input value={fallbackInviteValue} readOnly className="bg-white" />
                  <Button type="button" variant="outline" onClick={() => void handleCopyFallback()}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            {formError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            {formSuccess ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {formSuccess}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {activeTenantId && !canManageTenantInvites ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              You have view-only access for invites in this tenant.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {activeTenantId ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Invite List</CardTitle>
                <CardDescription>
                  Review pending and historical tenant invites.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void invitesQuery.refetch()}
                disabled={invitesQuery.isFetching}
              >
                <RotateCcw className={`h-4 w-4 ${invitesQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Search email, role, status..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="sm:col-span-2"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {invitesQuery.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {getApiErrorMessage(invitesQuery.error, "Unable to load invites.")}
              </div>
            ) : null}

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                        Loading invites...
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                        No invites found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell>{INVITE_ROLE_LABELS[invite.role]}</TableCell>
                        <TableCell>
                          <Badge variant={getInviteStatusVariant(invite.status)}>
                            {invite.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{invite.expiresAt ? formatDateTime(invite.expiresAt) : "-"}</TableCell>
                        <TableCell>{invite.invitedBy ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          {canManageTenantInvites && canRevokeInvite(invite.status) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700"
                              disabled={revokingInviteId === invite.id}
                              onClick={() => void handleRevokeInvite(invite.id)}
                            >
                              {revokingInviteId === invite.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <MailPlus className="h-3.5 w-3.5" />
                              )}
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
