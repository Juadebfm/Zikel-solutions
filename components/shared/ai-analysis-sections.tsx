"use client"

import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AskAiAnalysis, AskAiQuickAction, AskAiRisk, AskAiTopPriority } from "@/services/ai.service"

interface AiAnalysisSectionsProps {
  analysis?: AskAiAnalysis
  onQuickAction?: (action: string, label: string) => void
}

function toReadableLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase())
}

function formatUnknown(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "string") return value.trim() || "-"
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map((item) => formatUnknown(item)).join(", ") || "-"
  try {
    return JSON.stringify(value)
  } catch {
    return "-"
  }
}

function getPriorityTitle(priority: AskAiTopPriority): string {
  const candidate =
    priority.title ??
    priority.label ??
    priority.name ??
    priority.priority ??
    "Priority item"
  return formatUnknown(candidate)
}

function getRiskTitle(risk: AskAiRisk): string {
  const candidate =
    risk.title ??
    risk.label ??
    risk.name ??
    "Risk item"
  return formatUnknown(candidate)
}

function getQuickActionLabel(action: AskAiQuickAction): string {
  return formatUnknown(action.label ?? action.title ?? action.action ?? "Quick action")
}

export function AiAnalysisSections({ analysis, onQuickAction }: AiAnalysisSectionsProps) {
  if (!analysis) {
    return null
  }

  const topPriorities = analysis.topPriorities ?? []
  const risks = analysis.risks ?? []
  const quickActions = analysis.quickActions ?? []
  const missingData = analysis.missingData ?? []
  const snapshotEntries =
    analysis.platformSnapshot && typeof analysis.platformSnapshot === "object"
      ? Object.entries(analysis.platformSnapshot)
      : []

  return (
    <div className="space-y-3">
      {analysis.contextSummary ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          {analysis.contextSummary}
        </div>
      ) : null}

      {topPriorities.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">What to do now</p>
          <div className="space-y-2">
            {topPriorities.slice(0, 4).map((priority, index) => (
              <div key={`${priority.id ?? getPriorityTitle(priority)}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{getPriorityTitle(priority)}</p>
                  {typeof priority.urgencyScore === "number" ? (
                    <Badge variant="outline" className="text-[10px]">
                      Urgency {priority.urgencyScore}
                    </Badge>
                  ) : null}
                </div>
                {priority.summary || priority.description ? (
                  <p className="mt-1 text-gray-700">{formatUnknown(priority.summary ?? priority.description)}</p>
                ) : null}
                {priority.recommendedAction ? (
                  <p className="mt-1.5 text-gray-800">
                    <span className="font-medium">Action:</span> {priority.recommendedAction}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {risks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Risks</p>
          <div className="space-y-2">
            {risks.slice(0, 4).map((risk, index) => (
              <div key={`${risk.id ?? getRiskTitle(risk)}-${index}`} className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-red-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{getRiskTitle(risk)}</span>
                </div>
                {risk.summary || risk.description ? (
                  <p className="mt-1 text-red-900/85">{formatUnknown(risk.summary ?? risk.description)}</p>
                ) : null}
                {risk.recommendedAction ? (
                  <p className="mt-1.5 text-red-900">
                    <span className="font-medium">Mitigation:</span> {risk.recommendedAction}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {missingData.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Missing data</p>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-2.5 text-xs text-amber-900">
            <ul className="space-y-1.5 pl-4 list-disc">
              {missingData.slice(0, 4).map((item, index) => (
                <li key={`${item.id ?? index}`}>
                  {formatUnknown(item.label ?? item.field ?? item.name ?? item.message ?? item.description ?? "Missing item")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {snapshotEntries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Platform snapshot</p>
          <div className="grid grid-cols-2 gap-2">
            {snapshotEntries.slice(0, 6).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-emerald-700">{toReadableLabel(key)}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">{formatUnknown(value)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {quickActions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Quick actions</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.slice(0, 6).map((action, index) => {
              const label = getQuickActionLabel(action)
              const actionValue = formatUnknown(action.action)
              return (
                <Button
                  key={`${actionValue}-${index}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => onQuickAction?.(actionValue, label)}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  {label}
                </Button>
              )
            })}
          </div>
        </div>
      ) : null}

      {analysis.responseMode || analysis.strengthProfile ? (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          {analysis.responseMode ? (
            <Badge variant="secondary" className="text-[11px]">
              <ClipboardList className="mr-1 h-3 w-3" />
              Mode: {analysis.responseMode}
            </Badge>
          ) : null}
          {analysis.strengthProfile ? (
            <Badge variant="secondary" className="text-[11px] capitalize">
              Profile: {analysis.strengthProfile}
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
