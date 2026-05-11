"use client"

import { Gauge, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuota } from "@/hooks/api/use-billing"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function QuotaCard() {
  const { data: quota, isLoading } = useQuota()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!quota) return null

  const totalPool = quota.bundledCalls + quota.topUpCalls
  const used = Math.max(0, quota.usedCalls)
  const remaining = Math.max(0, quota.remainingCalls)
  const usedPct = totalPool > 0 ? Math.min(100, Math.round((used / totalPool) * 100)) : 0
  const remainingTone =
    remaining <= 10 ? "text-red-700" : remaining <= 100 ? "text-amber-700" : "text-emerald-700"
  const barTone =
    remaining <= 10 ? "bg-red-500" : remaining <= 100 ? "bg-amber-500" : "bg-emerald-500"

  const sortedUsage = [...quota.perUserUsage].sort((a, b) => b.callsThisPeriod - a.callsThisPeriod)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          AI quota this period
        </CardTitle>
        <CardDescription>
          Period {formatDate(quota.periodStart)} – {formatDate(quota.periodEnd)} · resets{" "}
          {formatDate(quota.resetAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={`text-3xl font-bold ${remainingTone}`}>
              {remaining.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">calls remaining</span>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${barTone} transition-all`}
              style={{ width: `${usedPct}%` }}
              aria-label={`${usedPct}% used`}
            />
          </div>

          <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              Bundled:{" "}
              <span className="font-medium text-foreground">
                {quota.bundledCalls.toLocaleString()}
              </span>
            </div>
            <div>
              Top-ups:{" "}
              <span className="font-medium text-foreground">
                +{quota.topUpCalls.toLocaleString()}
              </span>
            </div>
            <div>
              Used:{" "}
              <span className="font-medium text-foreground">
                {used.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {sortedUsage.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4" />
              Usage by user
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Calls this period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsage.map((row) => (
                  <TableRow key={row.userId}>
                    <TableCell>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.email}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.role}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.callsThisPeriod.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
