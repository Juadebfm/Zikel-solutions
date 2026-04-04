"use client"

import { AlertTriangle, Info, Lightbulb } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AskAiHighlight } from "@/services/ai.service"

// ─── Urgency styling ────────────────────────────────────────────

const urgencyConfig: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  high: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
  medium: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  low: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", badge: "bg-gray-100 text-gray-600" },
}

// ─── Props ──────────────────────────────────────────────────────

interface AiResponseSectionsProps {
  highlights?: AskAiHighlight[]
  tip?: string | null
  onAction?: (action: string, label: string) => void
}

// ─── Component ──────────────────────────────────────────────────

export function AiResponseSections({ highlights, tip, onAction }: AiResponseSectionsProps) {
  const hasHighlights = highlights && highlights.length > 0
  const hasTip = tip !== null && tip !== undefined && tip.trim().length > 0

  if (!hasHighlights && !hasTip) return null

  return (
    <div className="space-y-3">
      {/* Highlights — priority cards with urgency badge */}
      {hasHighlights && (
        <div className="space-y-2">
          {highlights.map((highlight, index) => {
            const style = urgencyConfig[highlight.urgency] ?? urgencyConfig.medium
            return (
              <div
                key={`highlight-${highlight.title}-${index}`}
                className={cn("rounded-lg border p-3 text-xs", style.bg, style.border)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertTriangle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", style.text)} />
                    <p className={cn("font-semibold leading-tight", style.text)}>
                      {highlight.title}
                    </p>
                  </div>
                  <Badge className={cn("text-[10px] shrink-0 capitalize", style.badge)}>
                    {highlight.urgency}
                  </Badge>
                </div>
                <p className={cn("mt-1.5 ml-5.5", style.text, "opacity-80")}>
                  {highlight.reason}
                </p>
                {highlight.action && (
                  <p className={cn("mt-1.5 ml-5.5 font-medium", style.text)}>
                    &rarr; {highlight.action}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tip — insight banner */}
      {hasTip && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900 flex items-start gap-2">
          <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-600" />
          <p>{tip}</p>
        </div>
      )}
    </div>
  )
}

// Keep the old export name as an alias for backwards compatibility during migration
export { AiResponseSections as AiAnalysisSections }
