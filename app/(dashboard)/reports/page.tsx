"use client"

import { useCallback, useState } from "react"
import { format } from "date-fns"
import {
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  Loader2,
  Minus,
  PieChart,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"
import { cn } from "@/lib/utils"

import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { useReg44Pack, useReg45Pack, useRiDashboard, useRiDrilldown } from "@/hooks/api/use-reports"
import {
  reportsService,
  type EvidencePackFormat,
  type RiMetric,
  type RiMetricSummary,
} from "@/services/reports.service"
import { useToastStore } from "@/components/shared/toast"
import { useExportList, useCreateExport } from "@/hooks/api/use-exports"
import {
  exportsService,
  type ExportEntity,
  type ExportFormat,
  type ExportStatus,
} from "@/services/exports.service"

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
}

const metricStatusConfig: Record<string, { bg: string; text: string; border: string }> = {
  good: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
}

// ─── Page ───────────────────────────────────────────────────────

export default function ReportsPage() {
  const { allowed, showModal, setShowModal } = usePermissionGuard("canViewReports")
  const [activeTab, setActiveTab] = useState("evidence-packs")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-primary" />
          Reports
        </h1>
        <p className="text-gray-500 mt-1">
          Regulatory evidence packs and oversight reporting.
        </p>
      </div>

      <AccessBanner show={!allowed} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="evidence-packs">Evidence Packs</TabsTrigger>
          <TabsTrigger value="ri-dashboard">RI Dashboard</TabsTrigger>
          <TabsTrigger value="bulk-exports">Bulk Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence-packs" className="mt-6">
          <EvidencePacksTab />
        </TabsContent>

        <TabsContent value="ri-dashboard" className="mt-6">
          <RiDashboardTab />
        </TabsContent>

        <TabsContent value="bulk-exports" className="mt-6">
          <BulkExportsTab />
        </TabsContent>
      </Tabs>

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}

// ─── Evidence Packs Tab ─────────────────────────────────────────

function EvidencePacksTab() {
  const [homeId, setHomeId] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)
  const showToast = useToastStore((s) => s.show)

  const homesQuery = useHomesDropdown()

  const packParams = {
    homeId: homeId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const reg44Query = useReg44Pack(packParams, Boolean(homeId))
  const reg45Query = useReg45Pack(packParams, Boolean(homeId))

  const handleDownload = useCallback(
    async (type: "reg44" | "reg45", downloadFormat: EvidencePackFormat) => {
      const key = `${type}-${downloadFormat}`
      setDownloading(key)
      try {
        const blob =
          type === "reg44"
            ? await reportsService.downloadReg44Pack({ ...packParams, format: downloadFormat })
            : await reportsService.downloadReg45Pack({ ...packParams, format: downloadFormat })

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}-pack.${downloadFormat === "zip" ? "zip" : downloadFormat === "excel" ? "xlsx" : downloadFormat}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        showToast("Download started.")
      } catch {
        showToast("Failed to download evidence pack.")
      } finally {
        setDownloading(null)
      }
    },
    [packParams, showToast]
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reg 44 &amp; Reg 45 Evidence Packs</CardTitle>
          <CardDescription>
            Generate one-click evidence bundles for regulatory inspections.
            Select a home and date range to preview and download.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {!homeId && (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Select a home to generate evidence packs.</p>
          </CardContent>
        </Card>
      )}

      {homeId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvidencePackCard
            title="Regulation 44 — Monthly Visit"
            description="Evidence for the independent visitor's monthly report."
            loading={reg44Query.isLoading}
            itemCount={reg44Query.data?.items.length ?? 0}
            generatedAt={reg44Query.data?.generatedAt}
            onDownload={(fmt) => handleDownload("reg44", fmt)}
            downloading={downloading?.startsWith("reg44") ? downloading : null}
          />
          <EvidencePackCard
            title="Regulation 45 — Review"
            description="Evidence for the half-yearly quality of care review."
            loading={reg45Query.isLoading}
            itemCount={reg45Query.data?.items.length ?? 0}
            generatedAt={reg45Query.data?.generatedAt}
            onDownload={(fmt) => handleDownload("reg45", fmt)}
            downloading={downloading?.startsWith("reg45") ? downloading : null}
          />
        </div>
      )}
    </div>
  )
}

function EvidencePackCard({
  title,
  description,
  loading,
  itemCount,
  generatedAt,
  onDownload,
  downloading,
}: {
  title: string
  description: string
  loading: boolean
  itemCount: number
  generatedAt?: string
  onDownload: (format: EvidencePackFormat) => void
  downloading: string | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Evidence items:</span>{" "}
                <span className="font-semibold">{itemCount}</span>
              </p>
              {generatedAt && (
                <p>
                  <span className="text-muted-foreground">Generated:</span>{" "}
                  <span className="font-semibold">{formatDate(generatedAt)}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pdf", "excel", "zip"] as EvidencePackFormat[]).map((fmt) => (
                <Button
                  key={fmt}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onDownload(fmt)}
                  disabled={downloading !== null}
                >
                  {downloading?.endsWith(fmt) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  {fmt.toUpperCase()}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── RI Dashboard Tab ───────────────────────────────────────────

function RiDashboardTab() {
  const [homeId, setHomeId] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [drilldownMetric, setDrilldownMetric] = useState<RiMetric | null>(null)
  const [drilldownPage, setDrilldownPage] = useState(1)

  const homesQuery = useHomesDropdown()

  const dashboardParams = {
    homeId: homeId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const dashboardQuery = useRiDashboard(dashboardParams)

  const drilldownQuery = useRiDrilldown(
    {
      metric: drilldownMetric!,
      homeId: homeId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: drilldownPage,
      pageSize: 20,
    },
    Boolean(drilldownMetric)
  )

  const metrics = dashboardQuery.data?.metrics ?? []
  const drilldownItems = drilldownQuery.data?.items ?? []
  const drilldownMeta = drilldownQuery.data?.meta
  const drilldownTotalPages = Math.max(drilldownMeta?.totalPages ?? 1, 1)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Responsible Individual Monitoring</CardTitle>
          <CardDescription>
            Oversight metrics for compliance, safeguarding, staffing, and action
            completion across your homes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={(v) => { setHomeId(v === "all" ? "" : v); setDrilldownMetric(null); }}>
                <SelectTrigger><SelectValue placeholder="All homes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All homes</SelectItem>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {dashboardQuery.isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-5 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!dashboardQuery.isLoading && metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <MetricCard
              key={m.metric}
              metric={m}
              active={drilldownMetric === m.metric}
              onClick={() => {
                setDrilldownMetric(drilldownMetric === m.metric ? null : m.metric)
                setDrilldownPage(1)
              }}
            />
          ))}
        </div>
      )}

      {!dashboardQuery.isLoading && metrics.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <PieChart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No dashboard data available for the selected filters.</p>
          </CardContent>
        </Card>
      )}

      {drilldownMetric && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Drilldown: {drilldownQuery.data?.metricLabel ?? drilldownMetric}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drilldownQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/5" />
                  </div>
                ))}
              </div>
            ) : drilldownItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No detail data available.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drilldownItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell>{item.value}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(item.date)}</TableCell>
                        <TableCell>
                          {item.status ? (
                            <Badge variant="outline" className="text-xs capitalize">{item.status}</Badge>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {drilldownTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">Page {drilldownPage} of {drilldownTotalPages}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={drilldownPage <= 1} onClick={() => setDrilldownPage(drilldownPage - 1)}>Previous</Button>
                      <Button variant="outline" size="sm" disabled={drilldownPage >= drilldownTotalPages} onClick={() => setDrilldownPage(drilldownPage + 1)}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({
  metric,
  active,
  onClick,
}: {
  metric: RiMetricSummary
  active: boolean
  onClick: () => void
}) {
  const config = metricStatusConfig[metric.status] ?? metricStatusConfig.good
  const TrendIcon = metric.trend === "up" ? ArrowUp : metric.trend === "down" ? ArrowDown : Minus

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        active && "ring-2 ring-primary",
        config.border
      )}
      onClick={onClick}
    >
      <CardContent className="py-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {metric.label}
        </p>
        <div className="flex items-end gap-2 mt-2">
          <span className={cn("text-2xl font-bold", config.text)}>{metric.value}%</span>
          {metric.target != null && (
            <span className="text-xs text-muted-foreground mb-1">/ {metric.target}%</span>
          )}
          <TrendIcon className={cn("h-4 w-4 mb-1", config.text)} />
        </div>
        {metric.description && (
          <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
        )}
        <Badge className={cn("mt-2 text-[10px]", config.bg, config.text)}>
          {metric.status}
        </Badge>
      </CardContent>
    </Card>
  )
}

// ─── Bulk Exports Tab ──────────────────────────────────────────

const ENTITY_OPTIONS: { value: ExportEntity; label: string }[] = [
  { value: "homes", label: "Homes" },
  { value: "employees", label: "Employees" },
  { value: "young_people", label: "Young People" },
  { value: "vehicles", label: "Vehicles" },
  { value: "care_groups", label: "Care Groups" },
  { value: "tasks", label: "Tasks" },
  { value: "daily_logs", label: "Daily Logs" },
  { value: "audit", label: "Audit" },
]

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
]

const exportStatusBadge: Record<ExportStatus, { className: string; label: string }> = {
  pending: { className: "bg-gray-100 text-gray-700 border-gray-200", label: "Pending" },
  processing: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Processing" },
  completed: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completed" },
  failed: { className: "bg-red-50 text-red-700 border-red-200", label: "Failed" },
}

function BulkExportsTab() {
  const [entity, setEntity] = useState<ExportEntity | "">("")
  const [exportFormat, setExportFormat] = useState<ExportFormat | "">("")
  const [page, setPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const showToast = useToastStore((s) => s.show)

  const listQuery = useExportList({ page, pageSize: 20 })
  const createExport = useCreateExport()

  const jobs = listQuery.data?.items ?? []
  const meta = listQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)

  const handleCreate = useCallback(async () => {
    if (!entity || !exportFormat) return
    try {
      await createExport.mutateAsync({ entity, format: exportFormat })
      showToast("Export job created successfully.")
      setEntity("")
      setExportFormat("")
    } catch {
      showToast("Failed to create export job.")
    }
  }, [entity, exportFormat, createExport, showToast])

  const handleDownload = useCallback(async (id: string, fileName?: string | null) => {
    setDownloadingId(id)
    try {
      const blob = await exportsService.download(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName ?? `export-${id}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast("Download started.")
    } catch {
      showToast("Failed to download export.")
    } finally {
      setDownloadingId(null)
    }
  }, [showToast])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create Bulk Export</CardTitle>
          <CardDescription>
            Export data across your organisation. Select an entity and format to generate a downloadable file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entity} onValueChange={(v) => setEntity(v as ExportEntity)}>
                <SelectTrigger><SelectValue placeholder="Select entity..." /></SelectTrigger>
                <SelectContent>
                  {ENTITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                <SelectTrigger><SelectValue placeholder="Select format..." /></SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                onClick={handleCreate}
                disabled={!entity || !exportFormat || createExport.isPending}
                className="w-full sm:w-auto gap-2"
              >
                {createExport.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Jobs</CardTitle>
          <CardDescription>
            Track the status of your bulk data exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No export jobs yet. Create one above to get started.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    const badge = exportStatusBadge[job.status] ?? exportStatusBadge.pending
                    const entityLabel = ENTITY_OPTIONS.find((o) => o.value === job.entity)?.label ?? job.entity
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{entityLabel}</TableCell>
                        <TableCell className="uppercase text-xs">{job.format}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", badge.className)}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(job.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          {job.status === "completed" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              disabled={downloadingId === job.id}
                              onClick={() => handleDownload(job.id, job.fileName)}
                            >
                              {downloadingId === job.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              Download
                            </Button>
                          ) : job.status === "failed" ? (
                            <span className="text-xs text-red-500">{job.errorMessage ?? "Export failed"}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
