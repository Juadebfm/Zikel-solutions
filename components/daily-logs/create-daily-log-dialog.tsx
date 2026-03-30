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
import type { DailyLogRelatesTo } from "@/services/daily-logs.service"

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
  const [noteDate, setNoteDate] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [relatesToType, setRelatesToType] = useState<string>("")
  const [relatesToId, setRelatesToId] = useState("")
  const [triggerTaskFormKey, setTriggerTaskFormKey] = useState("")
  const [error, setError] = useState<string | null>(null)

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

  // Reset relates-to when home changes
  useEffect(() => {
    setRelatesToType("")
    setRelatesToId("")
  }, [homeId])

  // Set default note date
  useEffect(() => {
    if (open && !noteDate) {
      const now = new Date()
      const offset = now.getTimezoneOffset()
      const local = new Date(now.getTime() - offset * 60000)
      setNoteDate(local.toISOString().slice(0, 16))
    }
  }, [open, noteDate])

  // Build relates-to options grouped
  const relatesToOptions = useMemo(() => {
    const groups: Array<{
      label: string
      type: "young_person" | "vehicle"
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

    return groups
  }, [youngPeople])

  function resetForm() {
    setHomeId("")
    setNoteDate("")
    setCategory("")
    setNote("")
    setRelatesToType("")
    setRelatesToId("")
    setTriggerTaskFormKey("")
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

    if (!homeId) { setError("Please select a provision."); return }
    if (!noteDate) { setError("Please set a note date."); return }
    if (!category) { setError("Please select a category."); return }
    if (!note.trim()) { setError("Please enter a note."); return }

    let relatesTo: DailyLogRelatesTo | undefined
    if (relatesToId && relatesToType) {
      relatesTo = {
        type: relatesToType as "young_person" | "vehicle",
        id: relatesToId,
      }
    }

    try {
      await createMutation.mutateAsync({
        homeId,
        noteDate: new Date(noteDate).toISOString(),
        category,
        note,
        relatesTo: relatesTo ?? null,
        triggerTaskFormKey: triggerTaskFormKey || null,
      })
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create daily log.")
    }
  }

  // Parse the selected relates-to value (format: "type:id")
  function handleRelatesToChange(value: string) {
    if (value === "none") {
      setRelatesToType("")
      setRelatesToId("")
      return
    }
    const [type, id] = value.split(":")
    setRelatesToType(type)
    setRelatesToId(id)
  }

  const relatesToValue = relatesToId ? `${relatesToType}:${relatesToId}` : "none"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Daily Log</DialogTitle>
          <DialogDescription>
            Create a new daily log entry for a home.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Row 1: Provision + Relates To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeId">
                Provision <span className="text-red-500">*</span>
              </Label>
              <Select value={homeId} onValueChange={setHomeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select home..." />
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

            <div className="space-y-2">
              <Label>Relates To</Label>
              <Select
                value={relatesToValue}
                onValueChange={handleRelatesToChange}
                disabled={!homeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={homeId ? "Select..." : "Select a home first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Note Date + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noteDate">
                Note Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="noteDate"
                type="datetime-local"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {LOG_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Trigger Task */}
          <div className="space-y-2">
            <Label>Trigger Task</Label>
            <Select
              value={triggerTaskFormKey || "none"}
              onValueChange={(v) => setTriggerTaskFormKey(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select form template..." />
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

          {/* Row 4: Note */}
          <div className="space-y-2">
            <Label htmlFor="note">
              Note <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type something..."
              className="min-h-[160px]"
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/10,000
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
