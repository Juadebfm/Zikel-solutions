"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { useAuth } from "@/contexts/auth-context"
import { useTenantMemberships } from "@/hooks/api/use-tenants"
import type { TenantMembershipRecord } from "@/services/tenants.service"

const MAX_CAP = 100_000

/**
 * Per-user cap modes — BE semantics confirmed 2026-05-12, spec §M7:
 *
 *   - `disabled` → 0       — AI off for the user (403 AI_DISABLED_FOR_USER)
 *   - `capped`   → 1..100K — monthly call cap
 *
 * `null` is allowed on the wire and means "inherit from role cap" — but in
 * this UI we represent that as the *absence* of a row. Adding a row implies
 * the user wants an explicit override, so we omit an "Inherit" mode in
 * favour of the Remove (×) action.
 *
 * There is no per-user "uncapped" because the wire can't express it; to
 * give one user unlimited within a capped role, set a high explicit cap
 * (e.g. 100,000).
 */
type CapMode = "disabled" | "capped"

interface PerUserOverrideRow {
  userId: string
  name: string
  email: string
  mode: CapMode
  cap: string
}

export interface PerUserCapsTableProps {
  /** Current per-user caps map. `0` = disabled, positive int = monthly cap. */
  value: Record<string, number | null>
  onChange: (next: Record<string, number | null>) => void
}

function capToMode(value: number | null | undefined): CapMode {
  // Treat null/undefined as "capped" placeholder so adding-then-undoing
  // doesn't strand a row in an invalid mode. Real null entries shouldn't
  // exist in our table (they'd be omitted).
  if (value === 0) return "disabled"
  return "capped"
}

function rowToCap(row: PerUserOverrideRow): number {
  if (row.mode === "disabled") return 0
  const parsed = Number.parseInt(row.cap, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.min(parsed, MAX_CAP)
}

function displayName(membership: TenantMembershipRecord): string {
  const name = `${membership.firstName} ${membership.lastName}`.trim()
  return name.length > 0 ? name : membership.email
}

export function PerUserCapsTable({ value, onChange }: PerUserCapsTableProps) {
  const { session } = useAuth()
  const activeTenantId = session?.activeTenantId ?? null
  const membershipsQuery = useTenantMemberships(activeTenantId, { status: "active", limit: 100 })
  const memberships = useMemo<TenantMembershipRecord[]>(
    () => membershipsQuery.data?.items ?? [],
    [membershipsQuery.data],
  )
  const [pickerValue, setPickerValue] = useState("")

  const membershipByUserId = useMemo(() => {
    const map = new Map<string, TenantMembershipRecord>()
    for (const m of memberships) {
      if (m.userId) map.set(m.userId, m)
    }
    return map
  }, [memberships])

  // Only show entries that are real overrides (non-null). Null entries from
  // the server are ignored — they mean "inherit", which is the absence state.
  const rows: PerUserOverrideRow[] = useMemo(() => {
    return Object.entries(value)
      .filter(([, cap]) => cap !== null && cap !== undefined)
      .map(([userId, cap]) => {
        const m = membershipByUserId.get(userId)
        return {
          userId,
          name: m ? displayName(m) : userId,
          email: m?.email ?? "",
          mode: capToMode(cap),
          cap: typeof cap === "number" && cap > 0 ? String(cap) : "",
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [value, membershipByUserId])

  const overrideUserIds = new Set(rows.map((r) => r.userId))
  const availableMembers = memberships.filter(
    (m) => m.userId && !overrideUserIds.has(m.userId),
  )

  const updateRow = (userId: string, patch: Partial<PerUserOverrideRow>) => {
    const next = { ...value }
    const current = rows.find((r) => r.userId === userId)
    if (!current) return
    const updated: PerUserOverrideRow = { ...current, ...patch }
    next[userId] = rowToCap(updated)
    onChange(next)
  }

  const removeRow = (userId: string) => {
    const next = { ...value }
    delete next[userId]
    onChange(next)
  }

  const addRow = (userId: string) => {
    if (!userId) return
    // Default new overrides to a sensible cap (100/month). Owner can adjust.
    onChange({ ...value, [userId]: 100 })
    setPickerValue("")
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium">Per-user overrides</p>
        <p className="text-xs text-muted-foreground">
          Override the role default for specific users. Per BE: <span className="font-medium">Capped</span> sets a monthly limit, <span className="font-medium">Disabled</span> blocks AI for that user. Removing a row reverts them to their role&apos;s cap.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          There is no per-user &quot;uncapped&quot; mode — to grant one user unlimited within a capped role, set a high explicit number (e.g. 100,000).
        </p>
      </div>

      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Cap</TableHead>
              <TableHead className="text-right">Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.userId}>
                <TableCell>
                  <div className="font-medium">{row.name}</div>
                  {row.email ? (
                    <div className="text-xs text-muted-foreground">{row.email}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Select
                    value={row.mode}
                    onValueChange={(mode) => updateRow(row.userId, { mode: mode as CapMode })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capped">Capped</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {row.mode === "capped" ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`pu-cap-${row.userId}`} className="sr-only">
                        Monthly limit
                      </Label>
                      <Input
                        id={`pu-cap-${row.userId}`}
                        type="number"
                        min={1}
                        max={MAX_CAP}
                        inputMode="numeric"
                        className="w-28"
                        value={row.cap}
                        onChange={(e) => updateRow(row.userId, { cap: e.target.value })}
                      />
                      <span className="text-xs text-muted-foreground">/ mo</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(row.userId)}
                    aria-label={`Remove override for ${row.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No per-user overrides. Add one below.
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="pu-add-user" className="text-xs text-muted-foreground">
            Add override for…
          </Label>
          <Select value={pickerValue} onValueChange={setPickerValue}>
            <SelectTrigger id="pu-add-user">
              <SelectValue placeholder={availableMembers.length === 0 ? "All users have overrides" : "Pick a user"} />
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map((m) => (
                <SelectItem key={m.userId ?? m.id} value={m.userId ?? m.id}>
                  {displayName(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => addRow(pickerValue)}
          disabled={!pickerValue}
        >
          <Plus className="h-4 w-4" />
          Add override
        </Button>
      </div>
    </div>
  )
}
