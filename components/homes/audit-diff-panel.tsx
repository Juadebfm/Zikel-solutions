"use client"

import { ExternalLink } from "lucide-react"
import type { AuditDiffField } from "@/types"

interface AuditDiffPanelProps {
  before: AuditDiffField[]
  after: AuditDiffField[]
}

interface DiffRow {
  field: string
  beforeValue: string | null
  afterValue: string | null
  type: "changed" | "removed" | "added" | "unchanged"
}

function computeDiff(before: AuditDiffField[], after: AuditDiffField[]): DiffRow[] {
  const rows: DiffRow[] = []
  const beforeMap = new Map(before.map((f) => [f.field, f.value]))
  const afterMap = new Map(after.map((f) => [f.field, f.value]))
  const allFields = new Set([...before.map((f) => f.field), ...after.map((f) => f.field)])

  for (const field of allFields) {
    const bVal = beforeMap.get(field) ?? null
    const aVal = afterMap.get(field) ?? null

    if (bVal !== null && aVal !== null) {
      rows.push({
        field,
        beforeValue: bVal,
        afterValue: aVal,
        type: bVal === aVal ? "unchanged" : "changed",
      })
    } else if (bVal !== null && aVal === null) {
      rows.push({ field, beforeValue: bVal, afterValue: null, type: "removed" })
    } else if (bVal === null && aVal !== null) {
      rows.push({ field, beforeValue: null, afterValue: aVal, type: "added" })
    }
  }

  return rows
}

export function AuditDiffPanel({ before, after }: AuditDiffPanelProps) {
  const diffRows = computeDiff(before, after)

  return (
    <div className="space-y-2">
      {/* Show full record link */}
      <div className="flex justify-end">
        <button className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Show Full Record
        </button>
      </div>

      {/* Before / After panels */}
      <div className="grid grid-cols-2 border rounded-lg overflow-hidden">
        {/* Headers */}
        <div className="bg-gray-100 px-4 py-2.5 border-b border-r font-semibold text-sm text-gray-700">
          Before
        </div>
        <div className="bg-gray-100 px-4 py-2.5 border-b font-semibold text-sm text-gray-700">
          After
        </div>

        {/* Diff rows */}
        {diffRows.map((row, index) => (
          <DiffRowPair key={`${row.field}-${index}`} row={row} />
        ))}
      </div>
    </div>
  )
}

function DiffRowPair({ row }: { row: DiffRow }) {
  const beforeEmpty = row.beforeValue === null || row.beforeValue === ""
  const afterEmpty = row.afterValue === null || row.afterValue === ""

  const getBeforeClasses = () => {
    if (row.type === "removed" || (row.type === "changed" && !beforeEmpty)) {
      return "bg-red-50 text-red-700"
    }
    return "bg-white text-gray-600"
  }

  const getAfterClasses = () => {
    if (row.type === "added" || (row.type === "changed" && !afterEmpty)) {
      return "bg-green-50 text-green-700"
    }
    return "bg-white text-gray-600"
  }

  return (
    <>
      {/* Before cell */}
      <div className={`px-4 py-2 text-sm border-b border-r ${getBeforeClasses()}`}>
        {row.beforeValue !== null ? (
          <span>
            <span className={row.type === "removed" || row.type === "changed" ? "text-red-500 font-medium" : "text-gray-400"}>
              {row.type === "removed" || row.type === "changed" ? "- " : "- "}
            </span>
            {row.field}: {row.beforeValue || "~"}
          </span>
        ) : null}
      </div>

      {/* After cell */}
      <div className={`px-4 py-2 text-sm border-b ${getAfterClasses()}`}>
        {row.afterValue !== null ? (
          <span>
            <span className={row.type === "added" || row.type === "changed" ? "text-green-600 font-medium" : "text-gray-400"}>
              {row.type === "added" || row.type === "changed" ? "+ " : "+ "}
            </span>
            {row.field}: {row.afterValue || "~"}
          </span>
        ) : null}
      </div>
    </>
  )
}
