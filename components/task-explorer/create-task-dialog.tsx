"use client"

import { useMemo, useState } from "react"
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  useHomesDropdown,
  useYoungPeopleDropdown,
  useEmployeesDropdown,
  useFormTemplatesDropdown,
} from "@/hooks/api/use-dropdown-data"
import { useCreateTask } from "@/hooks/api/use-tasks"
import type { CreateTaskPayload } from "@/services/tasks.service"

// ─── Constants ───────────────────────────────────────────────────

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "compliance", label: "Compliance" },
  { value: "incident", label: "Incident" },
  { value: "maintenance", label: "Maintenance" },
  { value: "meeting", label: "Meeting" },
  { value: "documentation", label: "Documentation" },
  { value: "report", label: "Report" },
  { value: "checklist", label: "Checklist" },
  { value: "other", label: "Other" },
]

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

const ENTITY_TYPES = [
  { value: "home", label: "Home" },
  { value: "young_person", label: "Young Person" },
  { value: "vehicle", label: "Vehicle" },
  { value: "employee", label: "Employee" },
]

// ─── Props ───────────────────────────────────────────────────────

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ───────────────────────────────────────────────────

export function CreateTaskDialog({
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const createMutation = useCreateTask()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueAt, setDueAt] = useState("")
  const [type, setType] = useState("")
  const [homeId, setHomeId] = useState("")
  const [youngPersonId, setYoungPersonId] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Cached dropdown data
  const homesQuery = useHomesDropdown()
  const youngPeopleQuery = useYoungPeopleDropdown(homeId || undefined)
  const employeesQuery = useEmployeesDropdown(homeId || undefined)
  const formTemplatesQuery = useFormTemplatesDropdown()

  const homes = homesQuery.data ?? []
  const youngPeople = youngPeopleQuery.data ?? []
  const employees = employeesQuery.data ?? []

  function resetForm() {
    setTitle("")
    setDescription("")
    setCategory("")
    setPriority("medium")
    setDueAt("")
    setType("")
    setHomeId("")
    setYoungPersonId("")
    setAssigneeId("")
    setError(null)
  }

  function handleHomeChange(value: string) {
    setHomeId(value)
    setYoungPersonId("")
    setAssigneeId("")
  }

  function handleClose() {
    if (!createMutation.isPending) {
      resetForm()
      onOpenChange(false)
    }
  }

  async function handleSubmit() {
    setError(null)

    if (!title.trim()) {
      setError("Please enter a task title.")
      return
    }

    const payload: CreateTaskPayload = {
      title: title.trim(),
    }

    if (description.trim()) payload.description = description.trim()
    if (category) payload.category = category
    if (priority) payload.priority = priority as CreateTaskPayload["priority"]
    if (dueAt) payload.dueAt = new Date(dueAt).toISOString()
    if (type) payload.type = type as CreateTaskPayload["type"]
    if (homeId) payload.homeId = homeId
    if (youngPersonId) payload.youngPersonId = youngPersonId
    if (assigneeId) payload.assigneeId = assigneeId

    try {
      await createMutation.mutateAsync(payload)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg">Create Task</DialogTitle>
          <DialogDescription>
            Create a new task. Only the title is required.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, context, or instructions..."
              className="min-h-[80px] resize-y"
              maxLength={5000}
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Due Date</Label>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Home */}
          <div className="space-y-1.5">
            <Label className="text-sm">Home</Label>
            <Select value={homeId} onValueChange={handleHomeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select home..." />
              </SelectTrigger>
              <SelectContent>
                {homes.map((h) => (
                  <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Young Person (shown when home is selected and type-relevant) */}
          {homeId && youngPeople.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm">Young Person</Label>
              <Select value={youngPersonId} onValueChange={setYoungPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select young person..." />
                </SelectTrigger>
                <SelectContent>
                  {youngPeople.map((yp) => (
                    <SelectItem key={yp.value} value={yp.value}>{yp.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignee (shown when home is selected) */}
          {homeId && employees.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
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
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
