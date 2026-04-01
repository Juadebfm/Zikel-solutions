"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import {
  useAuditEventDetail,
  useAuditEvents,
  useSecurityAlerts,
} from "@/hooks/api/use-audit"
import { getApiErrorMessage } from "@/lib/api/error"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

type AuditTab = "events" | "alerts"

export default function AuditPage() {
  const { user } = useAuth()
  const isAdminPersona = user?.role === "admin" || user?.role === "super_admin"

  const [activeTab, setActiveTab] = useState<AuditTab>("events")
  const [eventSearchInput, setEventSearchInput] = useState("")
  const [eventSearch, setEventSearch] = useState("")
  const [eventAction, setEventAction] = useState("all")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [alertSearchInput, setAlertSearchInput] = useState("")
  const [alertSearch, setAlertSearch] = useState("")
  const [alertSeverity, setAlertSeverity] = useState("all")

  const eventsQuery = useAuditEvents(
    {
      search: eventSearch || undefined,
      action: eventAction === "all" ? undefined : eventAction,
      page: 1,
      limit: 100,
    },
    isAdminPersona && activeTab === "events"
  )

  const alertsQuery = useSecurityAlerts(
    {
      search: alertSearch || undefined,
      severity: alertSeverity === "all" ? undefined : alertSeverity,
      page: 1,
      limit: 100,
    },
    isAdminPersona && activeTab === "alerts"
  )

  const detailQuery = useAuditEventDetail(
    selectedEventId,
    isAdminPersona && activeTab === "events"
  )

  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    if (eventsQuery.error) {
      showError(getApiErrorMessage(eventsQuery.error, "Unable to load audit events."))
    }
  }, [eventsQuery.error, showError])

  useEffect(() => {
    if (detailQuery.error) {
      showError(getApiErrorMessage(detailQuery.error, "Unable to load event detail."))
    }
  }, [detailQuery.error, showError])

  useEffect(() => {
    if (alertsQuery.error) {
      showError(getApiErrorMessage(alertsQuery.error, "Unable to load security alerts."))
    }
  }, [alertsQuery.error, showError])

  const eventRows = useMemo(() => eventsQuery.data?.items ?? [], [eventsQuery.data?.items])
  const alertRows = useMemo(() => alertsQuery.data?.items ?? [], [alertsQuery.data?.items])

  const actionOptions = useMemo(() => {
    const uniqueActions = new Set<string>()
    for (const event of eventRows) {
      if (event.action) {
        uniqueActions.add(event.action)
      }
    }

    return Array.from(uniqueActions).sort()
  }, [eventRows])

  if (!isAdminPersona) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit</h1>
          <p className="text-gray-500 mt-1">
            Audit explorer and security alerts are available for admin personas.
          </p>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-800">
                You do not have access to the audit explorer.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ask an administrator for the required permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit</h1>
        <p className="text-gray-500 mt-1">
          Explore tenant-scoped audit events and monitor derived security alerts.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AuditTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="events">Audit Events</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Explorer</CardTitle>
              <CardDescription>
                Search and inspect sensitive operations with tenant-aware boundaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="audit-search">Search</Label>
                  <div className="flex gap-2">
                    <Input
                      id="audit-search"
                      placeholder="Search action, actor, tenant, resource..."
                      value={eventSearchInput}
                      onChange={(event) => setEventSearchInput(event.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setEventSearch(eventSearchInput.trim())}
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Apply
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="audit-action">Action</Label>
                  <Select value={eventAction} onValueChange={setEventAction}>
                    <SelectTrigger id="audit-action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {actionOptions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {toTitleCase(action)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => void eventsQuery.refetch()}
                  disabled={eventsQuery.isFetching}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${eventsQuery.isFetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              <div className="rounded-lg border overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsQuery.isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-8 text-sm text-gray-500 text-center"
                        >
                          Loading audit events...
                        </TableCell>
                      </TableRow>
                    ) : eventRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-8 text-sm text-gray-500 text-center"
                        >
                          No audit events found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      eventRows.map((event) => {
                        const resourceLabel = event.resourceType
                          ? `${event.resourceType}${event.resourceId ? ` #${event.resourceId}` : ""}`
                          : "—"

                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">
                              {toTitleCase(event.action)}
                            </TableCell>
                            <TableCell>{event.actor}</TableCell>
                            <TableCell>{resourceLabel}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(event.status)}>
                                {toTitleCase(event.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateTime(event.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedEventId(event.id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedEventId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Details</CardTitle>
                <CardDescription>
                  Drill down into a single audit record for investigation context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading audit event details...
                  </div>
                ) : detailQuery.error ? (
                  null
                ) : !detailQuery.data ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                    Event detail is not available for this record.
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailItem label="Action" value={toTitleCase(detailQuery.data.action)} />
                      <DetailItem label="Actor" value={detailQuery.data.actor} />
                      <DetailItem label="Actor ID" value={detailQuery.data.actorId ?? "—"} />
                      <DetailItem label="Tenant ID" value={detailQuery.data.tenantId ?? "—"} />
                      <DetailItem
                        label="Resource"
                        value={
                          detailQuery.data.resourceType
                            ? `${detailQuery.data.resourceType} ${detailQuery.data.resourceId ?? ""}`.trim()
                            : "—"
                        }
                      />
                      <DetailItem
                        label="Created"
                        value={formatDateTime(detailQuery.data.createdAt)}
                      />
                    </div>
                    {detailQuery.data.message ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                        {detailQuery.data.message}
                      </div>
                    ) : null}
                    {detailQuery.data.details ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-800">Raw Details</p>
                        <pre className="max-h-72 overflow-auto overflow-x-auto rounded-lg border bg-gray-950 text-gray-100 p-3 text-[10px] sm:text-xs break-all">
                          {JSON.stringify(detailQuery.data.details, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Alerts</CardTitle>
              <CardDescription>
                Review derived alerts from the audit stream and track alert severity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="alert-search">Search</Label>
                  <div className="flex gap-2">
                    <Input
                      id="alert-search"
                      placeholder="Search title, status, actor..."
                      value={alertSearchInput}
                      onChange={(event) => setAlertSearchInput(event.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setAlertSearch(alertSearchInput.trim())}
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Apply
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alert-severity">Severity</Label>
                  <Select value={alertSeverity} onValueChange={setAlertSeverity}>
                    <SelectTrigger id="alert-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => void alertsQuery.refetch()}
                  disabled={alertsQuery.isFetching}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${alertsQuery.isFetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              <div className="rounded-lg border overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsQuery.isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-sm text-gray-500 text-center"
                        >
                          Loading security alerts...
                        </TableCell>
                      </TableRow>
                    ) : alertRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-sm text-gray-500 text-center"
                        >
                          No security alerts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      alertRows.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <p className="font-medium text-gray-900">{alert.title}</p>
                            {alert.message ? (
                              <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(alert.severity)}>
                              <AlertTriangle className="h-3 w-3" />
                              {toTitleCase(alert.severity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(alert.status)}>
                              {toTitleCase(alert.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{alert.actor ?? "system"}</TableCell>
                          <TableCell>{formatDateTime(alert.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getSeverityVariant(
  severity: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (severity) {
    case "critical":
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "resolved":
    case "closed":
    case "success":
      return "default"
    case "open":
    case "failed":
      return "destructive"
    case "in_progress":
    case "pending":
      return "secondary"
    default:
      return "outline"
  }
}

function toTitleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return DATE_TIME_FORMATTER.format(date)
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-1 break-all">{value}</p>
    </div>
  )
}
