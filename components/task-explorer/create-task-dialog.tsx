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
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTimePicker, parseLocalDateTimeValue } from "@/components/ui/date-time-picker"

import {
  useHomesDropdown,
  useYoungPeopleDropdown,
} from "@/hooks/api/use-dropdown-data"
import { useEmployeeList } from "@/hooks/api/use-employees"
import { useVehicleList } from "@/hooks/api/use-vehicles"
import { useCreateTask } from "@/hooks/api/use-tasks"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useTaskExplorerStore } from "@/stores/task-explorer-store"
import type { CreateTaskPayload } from "@/services/tasks.service"

// ─── Constants ───────────────────────────────────────────────────

const CATEGORIES = [
  { value: "task_log", label: "General Task" },
  { value: "daily_log", label: "Daily Log" },
  { value: "incident", label: "Incident / Observation" },
  { value: "document", label: "Document" },
  { value: "checklist", label: "Checklist / Inspection" },
  { value: "report", label: "Report" },
  { value: "compliance", label: "Compliance" },
  { value: "maintenance", label: "Maintenance" },
  { value: "meeting", label: "Meeting" },
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
  const setTaskSorting = useTaskExplorerStore((s) => s.setSorting)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueAt, setDueAt] = useState("")
  const [type, setType] = useState("")
  const [homeId, setHomeId] = useState("")
  const [youngPersonId, setYoungPersonId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [relatedEmployeeId, setRelatedEmployeeId] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const showError = useErrorModalStore((s) => s.show)

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  // Cached dropdown data
  const homesQuery = useHomesDropdown()
  const youngPeopleQuery = useYoungPeopleDropdown(homeId || undefined)
  const vehiclesQuery = useVehicleList({
    page: 1,
    pageSize: 100,
    isActive: true,
  })
  const homes = homesQuery.data ?? []
  const youngPeople = youngPeopleQuery.data ?? []
  const vehicles = useMemo(() => vehiclesQuery.data?.items ?? [], [vehiclesQuery.data?.items])
  const allEmployeesQuery = useEmployeeList({
    page: 1,
    pageSize: 100,
    isActive: true,
  })
  const allEmployees = useMemo(() => allEmployeesQuery.data?.items ?? [], [allEmployeesQuery.data?.items])
  const selectedVehicleHomeId = useMemo(() => {
    if (!vehicleId) return ""
    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId)
    return selectedVehicle?.homeId?.trim() ?? ""
  }, [vehicleId, vehicles])
  const assigneeHomeId = homeId || selectedVehicleHomeId
  const employeesForSelectedHome = useMemo(() => {
    const normalizedHomeId = homeId.trim()
    if (!normalizedHomeId) return allEmployees
    return allEmployees.filter((employee) => (employee.homeId ?? "").trim() === normalizedHomeId)
  }, [allEmployees, homeId])

  const assigneeOptions = useMemo(() => {
    const normalizedHomeId = assigneeHomeId.trim()
    if (!normalizedHomeId) return allEmployees

    const filtered = allEmployees.filter(
      (employee) => (employee.homeId ?? "").trim() === normalizedHomeId
    )

    // Some employee records may not include a reliable home mapping.
    // Fallback to all active staff so "Assigned To" never blocks task creation.
    return filtered.length > 0 ? filtered : allEmployees
  }, [allEmployees, assigneeHomeId])

  const selectedAssigneeId = useMemo(() => {
    if (!assigneeId) return ""
    return assigneeOptions.some((employee) => employee.id === assigneeId) ? assigneeId : ""
  }, [assigneeId, assigneeOptions])

  function getEmployeeDisplayName(employee: (typeof allEmployees)[number]): string {
    const firstName = employee.user?.firstName ?? employee.firstName ?? ""
    const lastName = employee.user?.lastName ?? employee.lastName ?? ""
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || employee.user?.name || employee.email || "Unknown employee"
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setCategory("")
    setPriority("medium")
    setDueAt("")
    setType("")
    setHomeId("")
    setYoungPersonId("")
    setVehicleId("")
    setRelatedEmployeeId("")
    setAssigneeId("")
    setError(null)
  }

  function handleTypeChange(value: string) {
    setType(value)
    // Reset entity fields when type changes
    setHomeId("")
    setYoungPersonId("")
    setVehicleId("")
    setRelatedEmployeeId("")
  }

  function handleHomeChange(value: string) {
    setHomeId(value)
    setYoungPersonId("")
    setRelatedEmployeeId("")
  }

  function handleVehicleChange(value: string) {
    setVehicleId(value)
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
    if (dueAt) {
      const parsedDueAt = parseLocalDateTimeValue(dueAt)
      if (!parsedDueAt) {
        setError("Please choose a valid due date and time.")
        return
      }

      const nowMinuteFloor = new Date()
      nowMinuteFloor.setSeconds(0, 0)

      if (parsedDueAt.getTime() < nowMinuteFloor.getTime()) {
        setError("Due date cannot be in the past. Please choose a future date and time.")
        return
      }

      payload.dueAt = parsedDueAt.toISOString()
    }
    if (type) payload.type = type as CreateTaskPayload["type"]
    if (homeId) payload.homeId = homeId
    if (youngPersonId) payload.youngPersonId = youngPersonId
    if (type === "vehicle" && vehicleId) payload.relatedEntityId = vehicleId
    if (type === "employee" && relatedEmployeeId) payload.relatedEntityId = relatedEmployeeId
    if (selectedAssigneeId) payload.assigneeId = selectedAssigneeId

    try {
      await createMutation.mutateAsync(payload)
      setTaskSorting("createdAt", "desc")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.")
    }
  }

  const fieldClass = "rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
  const triggerClass = "w-full rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
        <DialogHeader className="px-4 sm:px-7 pt-6 sm:pt-7 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Create Task</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a new task. Only the title is required.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-7 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={200}
              className={fieldClass}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, context, or instructions..."
              className={cn("min-h-[90px] resize-y", fieldClass)}
              maxLength={5000}
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className={triggerClass}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Due Date</Label>
              <DateTimePicker
                value={dueAt}
                onChange={setDueAt}
                disabledPast
                placeholder="Select due date and time"
                className={fieldClass}
              />
              <p className="text-xs text-muted-foreground">
                Pick today or a future date. Past dates are not allowed.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Related To</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select what this relates to..." />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Home — shown for home, young_person, and employee types */}
          {(type === "home" || type === "young_person" || type === "employee") && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Home</Label>
              <Select value={homeId} onValueChange={handleHomeChange}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select home..." />
                </SelectTrigger>
                <SelectContent>
                  {homes.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Young Person — only when type is young_person and a home is selected */}
          {type === "young_person" && homeId && youngPeople.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Young Person</Label>
              <Select value={youngPersonId} onValueChange={setYoungPersonId}>
                <SelectTrigger className={triggerClass}>
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

          {type === "vehicle" && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Vehicle</Label>
              <Select value={vehicleId} onValueChange={handleVehicleChange}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => {
                    const value = vehicle.id
                    const label = vehicle.name
                      || `${vehicle.make || ""} ${vehicle.model || ""}`.trim()
                      || `Vehicle ${vehicle.id}`
                    const subtitle = [vehicle.registration, vehicle.homeName].filter(Boolean).join(" — ")
                    return (
                      <SelectItem key={value} value={value}>
                        {subtitle ? `${label} (${subtitle})` : label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "employee" && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Related Employee</Label>
              <Select value={relatedEmployeeId} onValueChange={setRelatedEmployeeId}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employeesForSelectedHome.length === 0 ? (
                    <SelectItem value="__no_related_employees" disabled>
                      No employees available for the selected home
                    </SelectItem>
                  ) : null}
                  {employeesForSelectedHome.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {getEmployeeDisplayName(employee)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignee — always available; scoped to related home when known */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">Assignee</Label>
            <Select value={selectedAssigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {allEmployeesQuery.isLoading ? (
                  <SelectItem value="__assignee_loading" disabled>
                    Loading employees...
                  </SelectItem>
                ) : null}
                {!allEmployeesQuery.isLoading && assigneeOptions.length === 0 ? (
                  <SelectItem value="__assignee_empty" disabled>
                    No active employees available
                  </SelectItem>
                ) : null}
                {assigneeOptions.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {getEmployeeDisplayName(employee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {assigneeHomeId
                ? "Showing staff for the selected home context."
                : "Showing all active staff. Pick a related home to narrow the list."}
            </p>
          </div>

        </div>

        <DialogFooter className="px-4 sm:px-7 py-4 sm:py-5 bg-gray-50/50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-6"
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
