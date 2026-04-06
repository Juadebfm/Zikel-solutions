"use client"

import { useCallback, useMemo, useState } from "react"
import { format } from "date-fns"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  Play,
  RefreshCw,
  Shield,
  TrendingUp,
} from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { useHomesDropdown, useYoungPeopleDropdown } from "@/hooks/api/use-dropdown-data"
import {
  useYoungPersonChronology,
  useHomeChronology,
  useRiskAlerts,
  useRiskAlertDetail,
  useAcknowledgeRiskAlert,
  useMarkRiskAlertInProgress,
  useResolveRiskAlert,
  useAddRiskAlertNote,
  useEvaluateRiskAlerts,
  useYoungPersonPatterns,
  useHomePatterns,
} from "@/hooks/api/use-safeguarding"
import type {
  ChronologyEvent,
  RiskAlert,
  PatternGroup,
  PatternInsight,
} from "@/services/safeguarding.service"

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy, HH:mm")
}

const severityConfig: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700" },
  high: { bg: "bg-orange-100", text: "text-orange-700" },
  medium: { bg: "bg-amber-100", text: "text-amber-700" },
  low: { bg: "bg-blue-100", text: "text-blue-700" },
}

const alertStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-red-50", text: "text-red-700", label: "Open" },
  acknowledged: { bg: "bg-amber-50", text: "text-amber-700", label: "Acknowledged" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", label: "In Progress" },
  resolved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Resolved" },
}

// ─── Page ───────────────────────────────────────────────────────

export default function SafeguardingPage() {
  const [activeTab, setActiveTab] = useState("chronology")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Safeguarding
        </h1>
        <p className="text-gray-500 mt-1">
          Understanding each child&apos;s story — chronologies, patterns, and
          proactive care.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chronology">Chronology</TabsTrigger>
          <TabsTrigger value="risk-alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="chronology" className="mt-6">
          <ChronologyTab />
        </TabsContent>

        <TabsContent value="risk-alerts" className="mt-6">
          <RiskAlertsTab />
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <PatternsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Chronology Tab ─────────────────────────────────────────────

function ChronologyTab() {
  const [scope, setScope] = useState<"young-person" | "home">("young-person")
  const [homeId, setHomeId] = useState("")
  const [youngPersonId, setYoungPersonId] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [includeNarrative, setIncludeNarrative] = useState(true)

  const homesQuery = useHomesDropdown()
  const youngPeopleQuery = useYoungPeopleDropdown(homeId || undefined)

  const params = useMemo(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      includeNarrative,
    }),
    [dateFrom, dateTo, includeNarrative]
  )

  const ypQuery = useYoungPersonChronology(youngPersonId, params, scope === "young-person" && Boolean(youngPersonId))
  const homeQuery = useHomeChronology(homeId, params, scope === "home" && Boolean(homeId))

  const isLoading = scope === "young-person" ? ypQuery.isLoading : homeQuery.isLoading
  const events = (scope === "young-person" ? ypQuery.data?.items : homeQuery.data?.items) ?? []
  const hasSelection = scope === "young-person" ? Boolean(youngPersonId) : Boolean(homeId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Build a Child&apos;s Story</CardTitle>
          <CardDescription>
            View a chronological timeline of events to better understand a
            child&apos;s journey and needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>View by</Label>
              <Select value={scope} onValueChange={(v) => { setScope(v as "young-person" | "home"); setYoungPersonId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="young-person">Young Person</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={setHomeId}>
                <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
                <SelectContent>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scope === "young-person" && (
              <div className="space-y-2">
                <Label>Young Person</Label>
                <Select value={youngPersonId} onValueChange={setYoungPersonId} disabled={!homeId}>
                  <SelectTrigger><SelectValue placeholder="Select young person..." /></SelectTrigger>
                  <SelectContent>
                    {(youngPeopleQuery.data ?? []).map((yp) => (
                      <SelectItem key={yp.value} value={yp.value}>{yp.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasSelection && (
        <Card>
          <CardContent className="py-10 text-center">
            <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Select a {scope === "young-person" ? "young person" : "home"} to
              view their safeguarding chronology.
            </p>
          </CardContent>
        </Card>
      )}

      {hasSelection && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasSelection && !isLoading && events.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No events found for the selected period. This is a positive
              indicator.
            </p>
          </CardContent>
        </Card>
      )}

      {hasSelection && !isLoading && events.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-4">
            {events.map((event) => (
              <TimelineEvent key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineEvent({ event }: { event: ChronologyEvent }) {
  const sev = severityConfig[event.severity] ?? severityConfig.medium
  return (
    <div className="relative pl-12">
      <div className={cn("absolute left-3.5 top-2 h-3 w-3 rounded-full border-2 border-white", sev.bg)} />
      <Card>
        <CardContent className="py-3 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatDate(event.occurredAt)}</span>
            <Badge className={cn("text-[10px]", sev.bg, sev.text)}>{event.severity}</Badge>
            <Badge variant="outline" className="text-[10px]">{event.eventType}</Badge>
            {event.source && <Badge variant="outline" className="text-[10px]">{event.source}</Badge>}
          </div>
          <p className="text-sm font-medium">{event.title}</p>
          {event.narrative && (
            <p className="text-sm text-muted-foreground leading-relaxed">{event.narrative}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Risk Alerts Tab ────────────────────────────────────────────

function RiskAlertsTab() {
  const [statusFilter, setStatusFilter] = useState("")
  const [severityFilter, setSeverityFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  const alertsQuery = useRiskAlerts({
    status: statusFilter || undefined,
    severity: severityFilter || undefined,
    includeNotes: true,
    page,
    pageSize: 20,
  })

  const evaluateMutation = useEvaluateRiskAlerts()

  const alerts = alertsQuery.data?.items ?? []
  const meta = alertsQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All severities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => evaluateMutation.mutate()}
          disabled={evaluateMutation.isPending}
        >
          {evaluateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Run Evaluation
        </Button>
      </div>

      {alertsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4 flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!alertsQuery.isLoading && alerts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No risk alerts to display.</p>
          </CardContent>
        </Card>
      )}

      {!alertsQuery.isLoading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <RiskAlertCard
              key={alert.id}
              alert={alert}
              onView={() => setSelectedAlertId(alert.id)}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <RiskAlertDrawer
        alertId={selectedAlertId}
        open={selectedAlertId !== null}
        onClose={() => setSelectedAlertId(null)}
      />
    </div>
  )
}

function RiskAlertCard({ alert, onView }: { alert: RiskAlert; onView: () => void }) {
  const sev = severityConfig[alert.severity] ?? severityConfig.medium
  const status = alertStatusConfig[alert.status] ?? alertStatusConfig.open

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className={cn("mt-0.5 rounded-full p-2", sev.bg)}>
            <AlertTriangle className={cn("h-4 w-4", sev.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{alert.title}</p>
              <Badge className={cn("text-[10px]", sev.bg, sev.text)}>{alert.severity}</Badge>
              <Badge className={cn("text-[10px]", status.bg, status.text)}>{status.label}</Badge>
            </div>
            {alert.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{formatDate(alert.createdAt)}</span>
              {alert.targetName && <span>Target: {alert.targetName}</span>}
              {alert.ownerName && <span>Owner: {alert.ownerName}</span>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RiskAlertDrawer({
  alertId,
  open,
  onClose,
}: {
  alertId: string | null
  open: boolean
  onClose: () => void
}) {
  const [noteText, setNoteText] = useState("")
  const detailQuery = useRiskAlertDetail(alertId ?? "", open && Boolean(alertId))
  const acknowledgeMutation = useAcknowledgeRiskAlert()
  const inProgressMutation = useMarkRiskAlertInProgress()
  const resolveMutation = useResolveRiskAlert()
  const addNoteMutation = useAddRiskAlertNote()

  const alert = detailQuery.data
  const sev = severityConfig[alert?.severity ?? "medium"] ?? severityConfig.medium
  const status = alertStatusConfig[alert?.status ?? "open"] ?? alertStatusConfig.open

  const handleAddNote = useCallback(() => {
    if (!alertId || !noteText.trim()) return
    addNoteMutation.mutate(
      { id: alertId, content: noteText.trim() },
      { onSuccess: () => setNoteText("") }
    )
  }, [alertId, noteText, addNoteMutation])

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetTitle className="sr-only">
          {alert ? `Alert: ${alert.title}` : "Risk Alert"}
        </SheetTitle>
        <SheetDescription className="sr-only">Risk alert detail view</SheetDescription>

        {detailQuery.isLoading && (
          <div className="flex flex-col flex-1 p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Separator />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        )}

        {alert && !detailQuery.isLoading && (
          <>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">{alert.title}</h2>
                  <div className="flex gap-2">
                    <Badge className={cn("text-xs", sev.bg, sev.text)}>{alert.severity}</Badge>
                    <Badge className={cn("text-xs", status.bg, status.text)}>{status.label}</Badge>
                    {alert.type && <Badge variant="outline" className="text-xs">{alert.type}</Badge>}
                  </div>
                  {alert.description && (
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(alert.createdAt)}</p>
                  </div>
                  {alert.targetName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Relates To</p>
                      <p className="font-medium">{alert.targetName}</p>
                    </div>
                  )}
                  {alert.ownerName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-medium">{alert.ownerName}</p>
                    </div>
                  )}
                  {alert.acknowledgedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Acknowledged</p>
                      <p className="font-medium">{formatDate(alert.acknowledgedAt)}</p>
                    </div>
                  )}
                  {alert.resolvedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="font-medium">{formatDate(alert.resolvedAt)}</p>
                    </div>
                  )}
                </div>

                {(alert.notes ?? []).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Notes
                      </p>
                      {(alert.notes ?? []).map((note) => (
                        <div key={note.id} className="rounded-md border p-3 text-sm">
                          <p className="font-medium">{note.authorName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                          <p className="mt-1">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Add a Note</p>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="What observations or actions should be recorded?"
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addNoteMutation.isPending}
                  >
                    {addNoteMutation.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                    Add Note
                  </Button>
                </div>
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-3 flex flex-wrap items-center gap-2">
              {alert.status === "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                  disabled={acknowledgeMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-3 w-3" />
                  Acknowledge
                </Button>
              )}
              {(alert.status === "open" || alert.status === "acknowledged") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => inProgressMutation.mutate(alert.id)}
                  disabled={inProgressMutation.isPending}
                >
                  <Play className="mr-2 h-3 w-3" />
                  In Progress
                </Button>
              )}
              {alert.status !== "resolved" && (
                <Button
                  size="sm"
                  onClick={() => resolveMutation.mutate(alert.id)}
                  disabled={resolveMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-3 w-3" />
                  Resolve
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Pattern Mapping Tab ────────────────────────────────────────

function PatternsTab() {
  const [scope, setScope] = useState<"young-person" | "home">("young-person")
  const [homeId, setHomeId] = useState("")
  const [youngPersonId, setYoungPersonId] = useState("")

  const homesQuery = useHomesDropdown()
  const youngPeopleQuery = useYoungPeopleDropdown(homeId || undefined)

  const ypPatterns = useYoungPersonPatterns(youngPersonId, {}, scope === "young-person" && Boolean(youngPersonId))
  const homePatterns = useHomePatterns(homeId, {}, scope === "home" && Boolean(homeId))

  const isLoading = scope === "young-person" ? ypPatterns.isLoading : homePatterns.isLoading
  const data = scope === "young-person" ? ypPatterns.data : homePatterns.data
  const hasSelection = scope === "young-person" ? Boolean(youngPersonId) : Boolean(homeId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What Patterns Might Help Us Understand?</CardTitle>
          <CardDescription>
            Explore recurring themes and patterns that may give insight into a
            child&apos;s needs and experiences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>View by</Label>
              <Select value={scope} onValueChange={(v) => { setScope(v as "young-person" | "home"); setYoungPersonId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="young-person">Young Person</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={setHomeId}>
                <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
                <SelectContent>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scope === "young-person" && (
              <div className="space-y-2">
                <Label>Young Person</Label>
                <Select value={youngPersonId} onValueChange={setYoungPersonId} disabled={!homeId}>
                  <SelectTrigger><SelectValue placeholder="Select young person..." /></SelectTrigger>
                  <SelectContent>
                    {(youngPeopleQuery.data ?? []).map((yp) => (
                      <SelectItem key={yp.value} value={yp.value}>{yp.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!hasSelection && (
        <Card>
          <CardContent className="py-10 text-center">
            <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Select a {scope === "young-person" ? "young person" : "home"} to
              explore patterns.
            </p>
          </CardContent>
        </Card>
      )}

      {hasSelection && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasSelection && !isLoading && data && (
        <div className="space-y-6">
          {/* Insights */}
          {data.insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {data.patterns.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Identified Patterns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.patterns.map((pattern, i) => (
                  <PatternCard key={`${pattern.type}-${i}`} pattern={pattern} />
                ))}
              </div>
            </div>
          )}

          {data.patterns.length === 0 && data.insights.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No patterns identified for the selected period. Continue
                  observing and recording.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function InsightCard({ insight }: { insight: PatternInsight }) {
  return (
    <Card className="border-l-4 border-l-primary/60">
      <CardContent className="py-4">
        <p className="text-sm font-medium">{insight.summary}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-[10px]">
            Confidence: {Math.round(insight.confidence * 100)}%
          </Badge>
          {insight.relatedPatterns.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {insight.relatedPatterns.length} related pattern{insight.relatedPatterns.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const patternTypeConfig: Record<string, { label: string; icon: typeof TrendingUp }> = {
  frequency: { label: "Frequency", icon: TrendingUp },
  cluster: { label: "Cluster", icon: Clock },
  recurrence: { label: "Recurrence", icon: RefreshCw },
  coOccurrence: { label: "Co-Occurrence", icon: TrendingUp },
}

function PatternCard({ pattern }: { pattern: PatternGroup }) {
  const config = patternTypeConfig[pattern.type] ?? patternTypeConfig.frequency
  const Icon = config.icon

  return (
    <Card>
      <CardContent className="py-4 space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
          {pattern.score != null && (
            <Badge variant="outline" className="text-[10px]">Score: {Math.round(pattern.score * 100)}%</Badge>
          )}
        </div>
        <p className="text-sm font-medium">{pattern.label}</p>
        {pattern.description && (
          <p className="text-sm text-muted-foreground">{pattern.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {pattern.incidents.length} related event{pattern.incidents.length !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  )
}
