"use client"

import { useMemo, useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useAiRestrictions, useUpdateAiRestrictions } from "@/hooks/api/use-billing"
import type { AiRestrictions } from "@/services/billing.service"
import { useToastStore } from "@/components/shared/toast"
import { getApiErrorMessage } from "@/lib/api/error"

type CapMode = "uncapped" | "disabled" | "capped"

interface RoleFormRow {
  role: string
  label: string
  mode: CapMode
  cap: string
}

const ROLE_DEFINITIONS: Array<{ role: string; label: string }> = [
  { role: "tenant_admin", label: "Admin (Owner)" },
  { role: "sub_admin", label: "Sub-admin" },
  { role: "staff", label: "Staff" },
]

const MAX_CAP = 100_000

function valueToMode(value: number | null | undefined): CapMode {
  if (value === null || value === undefined) return "uncapped"
  if (value === 0) return "disabled"
  return "capped"
}

function modeToValue(mode: CapMode, cap: string): number | null {
  if (mode === "uncapped") return null
  if (mode === "disabled") return 0
  const parsed = Number.parseInt(cap, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.min(parsed, MAX_CAP)
}

export function AiRestrictionsForm() {
  const { data, isLoading } = useAiRestrictions()

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Remount the editable form whenever the server payload identity changes —
  // useState lazy initializer reads `data` cleanly on the first render of the new instance.
  return <AiRestrictionsFormInner key={data.updatedAt ?? "initial"} restrictions={data} />
}

function AiRestrictionsFormInner({ restrictions }: { restrictions: AiRestrictions }) {
  const showToast = useToastStore((s) => s.show)
  const updateMutation = useUpdateAiRestrictions()
  const initialRows = useMemo<RoleFormRow[]>(
    () =>
      ROLE_DEFINITIONS.map(({ role, label }) => {
        const value = restrictions.perRoleCaps?.[role]
        return {
          role,
          label,
          mode: valueToMode(value),
          cap: value && value > 0 ? String(value) : "",
        }
      }),
    [restrictions],
  )
  const [rows, setRows] = useState<RoleFormRow[]>(initialRows)

  const isDirty = useMemo(() => {
    return rows.some((row, i) => {
      const original = initialRows[i]
      return row.mode !== original.mode || (row.mode === "capped" && row.cap !== original.cap)
    })
  }, [rows, initialRows])

  const handleSave = async () => {
    const perRoleCaps: Record<string, number | null> = {}
    for (const row of rows) {
      perRoleCaps[row.role] = modeToValue(row.mode, row.cap)
    }

    try {
      await updateMutation.mutateAsync({ perRoleCaps })
      showToast("AI access rules saved.")
    } catch (error) {
      showToast(getApiErrorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          AI access controls
        </CardTitle>
        <CardDescription>
          Set per-role monthly AI call limits. <span className="font-medium">Uncapped</span> draws
          from the org pool freely. <span className="font-medium">Disabled</span> blocks AI entirely
          for that role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rows.map((row, idx) => {
          const isCapped = row.mode === "capped"
          return (
            <div key={row.role} className="rounded-lg border border-border p-4">
              <div className="mb-3 font-medium">{row.label}</div>

              <RadioGroup
                value={row.mode}
                onValueChange={(value) =>
                  setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, mode: value as CapMode } : r)))
                }
                className="grid gap-2 sm:grid-cols-3"
              >
                <Label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="uncapped" />
                  Uncapped
                </Label>
                <Label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="capped" />
                  Capped
                </Label>
                <Label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="disabled" />
                  Disabled
                </Label>
              </RadioGroup>

              {isCapped ? (
                <div className="mt-3 flex items-center gap-2">
                  <Label htmlFor={`cap-${row.role}`} className="text-sm text-muted-foreground">
                    Monthly limit
                  </Label>
                  <Input
                    id={`cap-${row.role}`}
                    type="number"
                    min={1}
                    max={MAX_CAP}
                    inputMode="numeric"
                    className="w-32"
                    value={row.cap}
                    onChange={(event) =>
                      setRows((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, cap: event.target.value } : r))
                      )
                    }
                  />
                  <span className="text-sm text-muted-foreground">calls / month</span>
                </div>
              ) : null}
            </div>
          )
        })}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save AI access rules
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Per-user overrides can be set from the Users page once a user is selected.
        </p>
      </CardContent>
    </Card>
  )
}
