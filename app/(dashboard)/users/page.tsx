"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Copy, Loader2, MailPlus, RotateCcw, UserCog, UserPlus } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import {
  useCreateTenantInviteLink,
  useCreateTenantStaff,
  useCreateTenantInvite,
  useRevokeTenantInviteLink,
  useRevokeTenantInvite,
  useTenantInviteLinks,
  useTenantInvites,
  useTenantMemberships,
  useUpdateTenantMembership,
} from "@/hooks/api/use-tenants"
import { getApiErrorMessage } from "@/lib/api/error"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { canManageTenantAdministration, getAllowedInviteRoles } from "@/lib/auth/rbac"
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

type StaffProvisionRole = Exclude<TenantRole, "tenant_admin">
const JOIN_BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zikel.com").replace(/\/$/, "")

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

function getInviteLinkStatus(link: { isActive: boolean; expiresAt: string | null }): "active" | "expired" | "revoked" {
  if (!link.isActive) {
    return "revoked"
  }

  if (!link.expiresAt) {
    return "active"
  }

  const expiresAt = new Date(link.expiresAt)
  if (Number.isNaN(expiresAt.getTime())) {
    return "active"
  }

  return expiresAt.getTime() < Date.now() ? "expired" : "active"
}

function getInviteLinkStatusVariant(status: "active" | "expired" | "revoked"): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "revoked":
      return "secondary"
    default:
      return "outline"
  }
}

function buildJoinInviteLink(code: string): string {
  return `${JOIN_BASE_URL}/join/${code}`
}

function getMembershipStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "suspended":
    case "revoked":
      return "secondary"
    default:
      return "outline"
  }
}

function canApproveMembership(status: string): boolean {
  return status === "pending_approval"
}

export default function UsersPage() {
  const { user, session } = useAuth()
  const activeTenantId = session?.activeTenantId ?? null
  const activeTenantRole = session?.activeTenantRole ?? null
  const canManageTenantAdministrationAccess = canManageTenantAdministration(user?.role, activeTenantRole)
  const allowedInviteRoles = useMemo(
    () => getAllowedInviteRoles(user?.role, activeTenantRole),
    [activeTenantRole, user?.role]
  )
  const allowedStaffRoles = useMemo(
    () =>
      allowedInviteRoles.filter(
        (role): role is StaffProvisionRole => role === "sub_admin" || role === "staff"
      ),
    [allowedInviteRoles]
  )

  const invitesQuery = useTenantInvites(activeTenantId, {
    page: 1,
    limit: 100,
  })
  const inviteLinksQuery = useTenantInviteLinks(activeTenantId, {
    page: 1,
    limit: 100,
  })
  const membershipsQuery = useTenantMemberships(activeTenantId, {
    page: 1,
    limit: 200,
  })
  const createInviteLinkMutation = useCreateTenantInviteLink(activeTenantId)
  const createInviteMutation = useCreateTenantInvite(activeTenantId)
  const createStaffMutation = useCreateTenantStaff(activeTenantId)
  const revokeInviteLinkMutation = useRevokeTenantInviteLink(activeTenantId)
  const revokeInviteMutation = useRevokeTenantInvite(activeTenantId)
  const updateMembershipMutation = useUpdateTenantMembership(activeTenantId)

  const [staffFirstName, setStaffFirstName] = useState("")
  const [staffLastName, setStaffLastName] = useState("")
  const [staffEmail, setStaffEmail] = useState("")
  const [staffRole, setStaffRole] = useState<StaffProvisionRole>("staff")
  const [inviteLinkRole, setInviteLinkRole] = useState<StaffProvisionRole>("staff")
  const [inviteLinkExpiresInHours, setInviteLinkExpiresInHours] = useState("")
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TenantRole>("staff")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "revoked" | "expired">("all")
  const [search, setSearch] = useState("")
  const [membershipStatusFilter, setMembershipStatusFilter] = useState<"all" | "active" | "invited" | "pending_approval" | "suspended" | "revoked">("all")
  const [membershipSearch, setMembershipSearch] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [fallbackInviteValue, setFallbackInviteValue] = useState<string | null>(null)
  const showError = useErrorModalStore((s) => s.show)
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null)
  const [revokingInviteLinkId, setRevokingInviteLinkId] = useState<string | null>(null)
  const [approvingMembershipId, setApprovingMembershipId] = useState<string | null>(null)

  useEffect(() => {
    if (allowedInviteRoles.length > 0) {
      setInviteRole(allowedInviteRoles[0])
    }
  }, [allowedInviteRoles])

  useEffect(() => {
    if (allowedStaffRoles.length > 0) {
      setStaffRole(allowedStaffRoles[0])
      setInviteLinkRole(allowedStaffRoles[0])
    }
  }, [allowedStaffRoles])

  useEffect(() => {
    if (formError) {
      showError(formError)
      setFormError(null)
    }
  }, [formError, showError])

  useEffect(() => {
    if (inviteLinksQuery.error) {
      showError(getApiErrorMessage(inviteLinksQuery.error, "Unable to load invite links."))
    }
  }, [inviteLinksQuery.error, showError])

  useEffect(() => {
    if (membershipsQuery.error) {
      showError(getApiErrorMessage(membershipsQuery.error, "Unable to load members."))
    }
  }, [membershipsQuery.error, showError])

  useEffect(() => {
    if (invitesQuery.error) {
      showError(getApiErrorMessage(invitesQuery.error, "Unable to load invites."))
    }
  }, [invitesQuery.error, showError])

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

  const inviteLinkRows = useMemo(() => {
    return (inviteLinksQuery.data?.items ?? []).map((link) => ({
      ...link,
      status: getInviteLinkStatus(link),
      shareUrl: buildJoinInviteLink(link.code),
    }))
  }, [inviteLinksQuery.data?.items])

  const filteredMembershipRows = useMemo(() => {
    const membershipRows = membershipsQuery.data?.items ?? []
    const query = membershipSearch.trim().toLowerCase()

    return membershipRows.filter((membership) => {
      if (membershipStatusFilter !== "all" && membership.status !== membershipStatusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      const fullName = `${membership.firstName} ${membership.lastName}`.trim().toLowerCase()
      return (
        membership.email.toLowerCase().includes(query) ||
        membership.role.toLowerCase().includes(query) ||
        membership.status.toLowerCase().includes(query) ||
        fullName.includes(query)
      )
    })
  }, [membershipSearch, membershipStatusFilter, membershipsQuery.data?.items])

  const handleCreateStaff = async () => {
    if (!activeTenantId) {
      setFormError("Select an active tenant before provisioning staff.")
      return
    }

    if (!canManageTenantAdministrationAccess) {
      setFormError("You do not have permission to provision staff in this tenant.")
      return
    }

    if (!staffFirstName.trim() || !staffLastName.trim() || !staffEmail.trim()) {
      setFormError("First name, last name, and email are required.")
      return
    }

    setFormError(null)
    setFormSuccess(null)

    try {
      const payload = await createStaffMutation.mutateAsync({
        firstName: staffFirstName.trim(),
        lastName: staffLastName.trim(),
        email: staffEmail.trim(),
        role: staffRole,
      })

      setStaffFirstName("")
      setStaffLastName("")
      setStaffEmail("")

      const invitedSuffix =
        payload.membership?.status === "invited"
          ? " Activation email sent and member is in invited status."
          : ""

      setFormSuccess(`${payload.message || "Staff account provisioned."}${invitedSuffix}`)
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to provision staff account."))
    }
  }

  const handleCreateInviteLink = async () => {
    if (!activeTenantId) {
      setFormError("Select an active tenant before generating invite links.")
      return
    }

    if (!canManageTenantAdministrationAccess) {
      setFormError("You do not have permission to generate invite links in this tenant.")
      return
    }

    const expiresInHoursValue = inviteLinkExpiresInHours.trim()
    const parsedExpiry =
      expiresInHoursValue.length > 0 ? Number.parseInt(expiresInHoursValue, 10) : undefined

    if (
      expiresInHoursValue.length > 0 &&
      (parsedExpiry === undefined || !Number.isFinite(parsedExpiry) || parsedExpiry <= 0)
    ) {
      setFormError("Expiry must be a positive number of hours.")
      return
    }

    setFormError(null)
    setFormSuccess(null)
    setGeneratedInviteLink(null)

    try {
      const payload = await createInviteLinkMutation.mutateAsync({
        defaultRole: inviteLinkRole,
        expiresInHours: parsedExpiry,
      })

      const code = payload.link?.code
      if (code) {
        setGeneratedInviteLink(buildJoinInviteLink(code))
      }

      setFormSuccess(payload.message || "Invite link generated.")
      setInviteLinkExpiresInHours("")
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to generate invite link."))
    }
  }

  const handleCreateInvite = async () => {
    if (!activeTenantId) {
      setFormError("Select an active tenant before creating invites.")
      return
    }

    if (!canManageTenantAdministrationAccess) {
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

  const handleRevokeInviteLink = async (inviteLinkId: string) => {
    if (!activeTenantId) {
      return
    }

    setRevokingInviteLinkId(inviteLinkId)
    setFormError(null)
    setFormSuccess(null)

    try {
      const payload = await revokeInviteLinkMutation.mutateAsync(inviteLinkId)
      setFormSuccess(payload.message || "Invite link revoked.")
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to revoke invite link."))
    } finally {
      setRevokingInviteLinkId(null)
    }
  }

  const handleCopyValue = async (value: string, successMessage: string) => {
    if (!value || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setFormSuccess(successMessage)
    } catch {
      setFormError("Unable to copy value.")
    }
  }

  const handleApproveMembership = async (membershipId: string) => {
    if (!activeTenantId) {
      return
    }

    setApprovingMembershipId(membershipId)
    setFormError(null)
    setFormSuccess(null)

    try {
      const payload = await updateMembershipMutation.mutateAsync({
        membershipId,
        input: { status: "active" },
      })
      setFormSuccess(payload.message || "Membership approved.")
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to approve member."))
    } finally {
      setApprovingMembershipId(null)
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

      {activeTenantId && formSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {formSuccess}
        </div>
      ) : null}

      {activeTenantId && canManageTenantAdministrationAccess ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Staff</CardTitle>
            <CardDescription>
              Provision a staff account directly. The user receives an activation code and appears as invited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="staff-first-name">First name</Label>
                <Input
                  id="staff-first-name"
                  value={staffFirstName}
                  onChange={(event) => setStaffFirstName(event.target.value)}
                  placeholder="Jane"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-last-name">Last name</Label>
                <Input
                  id="staff-last-name"
                  value={staffLastName}
                  onChange={(event) => setStaffLastName(event.target.value)}
                  placeholder="Doe"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={staffEmail}
                  onChange={(event) => setStaffEmail(event.target.value)}
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff-role">Role</Label>
                <Select value={staffRole} onValueChange={(value) => setStaffRole(value as StaffProvisionRole)}>
                  <SelectTrigger id="staff-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStaffRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {INVITE_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => void handleCreateStaff()}
                  className="w-full gap-2"
                  disabled={createStaffMutation.isPending}
                >
                  {createStaffMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Provision Staff
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTenantId && canManageTenantAdministrationAccess ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Invite Links</CardTitle>
                <CardDescription>
                  Generate reusable join links that route staff to `/join/:code`.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void inviteLinksQuery.refetch()}
                disabled={inviteLinksQuery.isFetching}
              >
                <RotateCcw className={`h-4 w-4 ${inviteLinksQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="invite-link-role">Default role</Label>
                <Select
                  value={inviteLinkRole}
                  onValueChange={(value) => setInviteLinkRole(value as StaffProvisionRole)}
                >
                  <SelectTrigger id="invite-link-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStaffRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {INVITE_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-link-expiry">Expiry (hours)</Label>
                <Input
                  id="invite-link-expiry"
                  type="number"
                  min={1}
                  value={inviteLinkExpiresInHours}
                  onChange={(event) => setInviteLinkExpiresInHours(event.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => void handleCreateInviteLink()}
                  className="w-full gap-2"
                  disabled={createInviteLinkMutation.isPending}
                >
                  {createInviteLinkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Generate Link
                </Button>
              </div>
            </div>

            {generatedInviteLink ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800 mb-2">
                  Share this join URL with staff:
                </p>
                <div className="flex gap-2">
                  <Input value={generatedInviteLink} readOnly className="bg-white" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleCopyValue(generatedInviteLink, "Invite link copied.")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Default role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Share URL</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inviteLinksQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                        Loading invite links...
                      </TableCell>
                    </TableRow>
                  ) : inviteLinkRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                        No invite links found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inviteLinkRows.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.code}</TableCell>
                        <TableCell>{INVITE_ROLE_LABELS[link.defaultRole]}</TableCell>
                        <TableCell>
                          <Badge variant={getInviteLinkStatusVariant(link.status)}>{link.status}</Badge>
                        </TableCell>
                        <TableCell>{link.expiresAt ? formatDateTime(link.expiresAt) : "Never"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => void handleCopyValue(link.shareUrl, "Invite link copied.")}
                          >
                            Copy link
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          {link.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700"
                              disabled={revokingInviteLinkId === link.id}
                              onClick={() => void handleRevokeInviteLink(link.id)}
                            >
                              {revokingInviteLinkId === link.id ? (
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

      {activeTenantId && canManageTenantAdministrationAccess ? (
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleCopyValue(fallbackInviteValue, "Invite fallback copied.")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

          </CardContent>
        </Card>
      ) : null}

      {activeTenantId && !canManageTenantAdministrationAccess ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              You have view-only access for tenant users and invites in this tenant.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {activeTenantId ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">Members</CardTitle>
                <CardDescription>
                  Review tenant members and approve pending join requests.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void membershipsQuery.refetch()}
                disabled={membershipsQuery.isFetching}
              >
                <RotateCcw className={`h-4 w-4 ${membershipsQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Search name, email, role..."
                value={membershipSearch}
                onChange={(event) => setMembershipSearch(event.target.value)}
                className="sm:col-span-2"
              />
              <Select
                value={membershipStatusFilter}
                onValueChange={(value) => setMembershipStatusFilter(value as typeof membershipStatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="pending_approval">Pending approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membershipsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                        Loading members...
                      </TableCell>
                    </TableRow>
                  ) : filteredMembershipRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembershipRows.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell className="font-medium">
                          {[membership.firstName, membership.lastName].filter(Boolean).join(" ") || "-"}
                        </TableCell>
                        <TableCell>{membership.email || "-"}</TableCell>
                        <TableCell>{INVITE_ROLE_LABELS[membership.role]}</TableCell>
                        <TableCell>
                          <Badge variant={getMembershipStatusVariant(membership.status)}>
                            {membership.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{membership.createdAt ? formatDateTime(membership.createdAt) : "-"}</TableCell>
                        <TableCell className="text-right">
                          {canManageTenantAdministrationAccess && canApproveMembership(membership.status) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              disabled={approvingMembershipId === membership.id}
                              onClick={() => void handleApproveMembership(membership.id)}
                            >
                              {approvingMembershipId === membership.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Approve
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


            <div className="rounded-lg border overflow-hidden overflow-x-auto">
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
                          {canManageTenantAdministrationAccess && canRevokeInvite(invite.status) ? (
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
