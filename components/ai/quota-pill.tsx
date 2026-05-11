"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuota } from "@/hooks/api/use-billing"
import { cn } from "@/lib/utils"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

interface QuotaPillProps {
  className?: string
}

export function QuotaPill({ className }: QuotaPillProps) {
  const { data: quota, isLoading } = useQuota()

  if (isLoading || !quota) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground",
          className,
        )}
      >
        <Sparkles className="h-3 w-3" />
        Loading…
      </span>
    )
  }

  const remaining = Math.max(0, quota.remainingCalls)
  const tone =
    remaining <= 10
      ? { ring: "bg-red-50 text-red-700 ring-red-200", icon: "text-red-600" }
      : remaining <= 100
        ? { ring: "bg-amber-50 text-amber-800 ring-amber-200", icon: "text-amber-600" }
        : { ring: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: "text-emerald-600" }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition hover:opacity-80",
            tone.ring,
            className,
          )}
          aria-label={`${remaining.toLocaleString()} AI calls remaining`}
        >
          <Sparkles className={cn("h-3 w-3", tone.icon)} />
          {remaining.toLocaleString()}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2 text-sm">
          <p className="font-semibold">AI quota this period</p>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Bundled</span>
              <span className="tabular-nums text-foreground">
                {quota.bundledCalls.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Top-ups</span>
              <span className="tabular-nums text-foreground">
                +{quota.topUpCalls.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Used</span>
              <span className="tabular-nums text-foreground">
                −{quota.usedCalls.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-foreground">
              <span className="font-medium">Remaining</span>
              <span className="font-semibold tabular-nums">
                {remaining.toLocaleString()}
              </span>
            </div>
            <p className="pt-1 text-xs">Resets {formatDate(quota.resetAt)}</p>
          </div>
          <Link
            href="/settings/billing"
            className="mt-2 block text-xs text-primary underline-offset-2 hover:underline"
          >
            Top up &amp; manage →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
