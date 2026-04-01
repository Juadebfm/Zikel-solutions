"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useHomeList } from "@/hooks/api/use-homes"
import { useYoungPersonList } from "@/hooks/api/use-young-people"
import { useFormList } from "@/hooks/api/use-forms"
import { useCreateDailyLog } from "@/hooks/api/use-daily-logs"
import { useErrorModalStore } from "@/components/shared/error-modal"
import type { CreateDailyLogPayload } from "@/services/daily-logs.service"

// ─── Constants ───────────────────────────────────────────────────

const LOG_CATEGORIES = [
  "General",
  "Incident",
  "Medication",
  "Behaviour",
  "Health",
  "Education",
  "Safeguarding",
  "Contact",
  "Activities",
  "Night Log",
  "Handover",
  "Other",
]

// ─── Props ───────────────────────────────────────────────────────

interface CreateDailyLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ───────────────────────────────────────────────────

export function CreateDailyLogDialog({
  open,
  onOpenChange,
}: CreateDailyLogDialogProps) {
  const createMutation = useCreateDailyLog()

  // Form state
  const [homeId, setHomeId] = useState("")
  const [relatesToValue, setRelatesToValue] = useState("")
  const [noteDate, setNoteDate] = useState(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  })
  const [category, setCategory] = useState("")
  const [triggerTaskFormKey, setTriggerTaskFormKey] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  // Data queries
  const homesQuery = useHomeList({ page: 1, pageSize: 100 })
  const youngPeopleQuery = useYoungPersonList({
    page: 1,
    pageSize: 100,
    homeId: homeId || undefined,
  })
  const formsQuery = useFormList({ page: 1, pageSize: 100, status: "released" })

  const homes = homesQuery.data?.items ?? []
  const youngPeople = youngPeopleQuery.data?.items ?? []
  const forms = formsQuery.data?.items ?? []

  function handleHomeChange(value: string) {
    setHomeId(value)
    setRelatesToValue("")
  }

  // Build grouped relates-to options
  const relatesToOptions = useMemo(() => {
    const groups: Array<{
      label: string
      type: string
      items: Array<{ id: string; name: string }>
    }> = []

    if (youngPeople.length > 0) {
      groups.push({
        label: "Young Person",
        type: "young_person",
        items: youngPeople.map((yp) => ({
          id: yp.id,
          name: `${yp.firstName} ${yp.lastName}`.trim(),
        })),
      })
    }

    // Vehicles can be added here when the hook exists

    return groups
  }, [youngPeople])

  function getDefaultNoteDate(): string {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  function resetForm() {
    setHomeId("")
    setRelatesToValue("")
    setNoteDate(getDefaultNoteDate())
    setCategory("")
    setTriggerTaskFormKey("")
    setNote("")
    setError(null)
  }

  function handleClose() {
    if (!createMutation.isPending) {
      resetForm()
      onOpenChange(false)
    }
  }

  async function handleSubmit() {
    setError(null)

    if (!homeId) { setError("Please select a home."); return }
    if (!relatesToValue) { setError("Please select who or what this log relates to."); return }
    if (!noteDate) { setError("Please set a date and time."); return }
    if (!category) { setError("Please select a category."); return }
    if (!note.trim()) { setError("Please enter the daily log content."); return }

    // Parse relates-to value ("young_person:id")
    const [type, id] = relatesToValue.split(":")

    const payload: CreateDailyLogPayload = {
      homeId,
      noteDate: new Date(noteDate).toISOString(),
      category,
      note,
      relatesTo: { type: type as "young_person" | "vehicle", id },
    }

    if (triggerTaskFormKey) {
      payload.triggerTaskFormKey = triggerTaskFormKey
    }

    try {
      await createMutation.mutateAsync(payload)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create daily log.")
    }
  }

  const selectedHomeName = homes.find((h) => h.id === homeId)?.name

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">Create Daily Log</DialogTitle>
          <DialogDescription>
            Record a daily log entry. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* 1. Home */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              Home <span className="text-red-500">*</span>
            </Label>
            <Select value={homeId} onValueChange={handleHomeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Which home is this log for?" />
              </SelectTrigger>
              <SelectContent>
                {homes.map((home) => (
                  <SelectItem key={home.id} value={home.id}>
                    {home.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Relates To (shown after home is selected) */}
          {homeId && (
            <div className="space-y-1.5">
              <Label className="text-sm">
                Relates To <span className="text-red-500">*</span>
              </Label>
              <Select value={relatesToValue} onValueChange={setRelatesToValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Who or what does this log relate to?" />
                </SelectTrigger>
                <SelectContent>
                  {relatesToOptions.map((group) => (
                    <SelectGroup key={group.type}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.items.map((item) => (
                        <SelectItem
                          key={`${group.type}:${item.id}`}
                          value={`${group.type}:${item.id}`}
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  {relatesToOptions.length === 0 && (
                    <SelectItem value="_empty" disabled>
                      No young people found for {selectedHomeName}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 3. Date & Category (side by side) */}
          {homeId && relatesToValue && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="noteDate" className="text-sm">
                  Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="noteDate"
                  type="datetime-local"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LOG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* 4. Trigger Task (optional) */}
          {homeId && relatesToValue && category && (
            <div className="space-y-1.5">
              <Label className="text-sm">Trigger Task</Label>
              <Select
                value={triggerTaskFormKey || "none"}
                onValueChange={(v) => setTriggerTaskFormKey(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional — link a form template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {forms.map((form) => (
                    <SelectItem key={form.key} value={form.key}>
                      {form.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 5. Daily Log content */}
          {homeId && relatesToValue && category && (
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-sm">
                Daily Log <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what happened, observations, actions taken..."
                className="min-h-[160px] resize-y"
                maxLength={10000}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Be specific and factual. Include times, names, and outcomes.
                </p>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {note.length.toLocaleString()}/10,000
                </span>
              </div>
            </div>
          )}

        </div>

        <Separator />

        <DialogFooter className="px-6 py-4 bg-gray-50/50">
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
