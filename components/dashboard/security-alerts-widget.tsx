"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSecurityAlerts } from "@/hooks/api/use-audit"
import type { SecurityAlert } from "@/services/audit.service"

const MAX_ROWS = 5

function severityTone(severity: string): { badge: string; icon: string } {
  switch (severity.toLowerCase()) {
    case "critical":
    case "high":
      return { badge: "bg-red-100 text-red-800", icon: "text-red-600" }
    case "medium":
      return { badge: "bg-amber-100 text-amber-800", icon: "text-amber-600" }
    case "low":
    default:
      return { badge: "bg-muted text-muted-foreground", icon: "text-muted-foreground" }
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return ""
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return ""
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (diffSec < 60) return "just now"
  const mins = Math.floor(diffSec / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SecurityAlertsWidget() {
  const { data, isLoading } = useSecurityAlerts({ limit: MAX_ROWS })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  const alerts = data?.items ?? []
  const total = data?.meta?.total ?? alerts.length

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Security
          </CardTitle>
          <CardDescription>No active alerts in the last 24 hours.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Security alerts
            </CardTitle>
            <CardDescription>
              {total === 1
                ? "1 active alert in the last 24 hours."
                : `${total} active alerts in the last 24 hours.`}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/audit?tab=security">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function AlertRow({ alert }: { alert: SecurityAlert }) {
  const tone = severityTone(alert.severity)
  return (
    <li className="flex items-start gap-3 rounded-md border border-border p-3">
      <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${tone.icon}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium">{alert.title}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone.badge}`}
          >
            {alert.severity}
          </span>
        </div>
        {alert.message ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{alert.message}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">{relativeTime(alert.createdAt)}</p>
      </div>
    </li>
  )
}
