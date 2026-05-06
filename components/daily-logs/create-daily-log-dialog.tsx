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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useHomeList } from "@/hooks/api/use-homes"
import { useYoungPersonList } from "@/hooks/api/use-young-people"
import { useFormList, useFormDetail } from "@/hooks/api/use-forms"
import { useCreateDailyLog } from "@/hooks/api/use-daily-logs"
import { useReflectivePrompts } from "@/hooks/api/use-safeguarding"
import { useVehicleList } from "@/hooks/api/use-vehicles"
import { useCalendarEvents } from "@/hooks/api/use-scheduling"
import { useEmployeeList } from "@/hooks/api/use-employees"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  CreateDailyLogPayload,
  DailyLogCategory,
  DailyLogRelatesTo,
} from "@/services/daily-logs.service"

// ─── Constants ───────────────────────────────────────────────────

const LOG_CATEGORIES = [
  "General",
  "Incident",
  "Medication",
  "Behaviour",
  "Education",
  "Personal Care",
  "Contact",
  "Safeguarding",
] as const

const ENTITY_TYPES = [
  { value: "young_person", label: "Young Person" },
  { value: "vehicle", label: "Vehicle" },
  { value: "employee", label: "Staff Member" },
  { value: "home_event", label: "Event" },
] as const

type EntityType = DailyLogRelatesTo["type"]
const RELATES_TO_NONE = "__none__"

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  General:
    "What happened during this shift? Note any key observations, activities, or conversations.",
  Incident:
    "What happened? When and where did it occur? Who was involved? What immediate actions were taken? Were any injuries sustained?",
  Medication:
    "Which medication was involved? Was it administered, refused, or an error? What was the dosage? What follow-up actions were taken?",
  Behaviour:
    "What behaviour was observed? What might the child have been communicating? How did you respond with empathy? What de-escalation was used?",
  Education:
    "What educational activities took place? How did the young person engage? Any achievements, concerns, or follow-up needed?",
  "Personal Care":
    "What personal care was provided or supported? How did the young person respond? Any dignity or preference considerations?",
  Contact:
    "Who was the contact with (family, social worker, professional)? What was discussed? Were any decisions or actions agreed?",
  Safeguarding:
    "What safeguarding concern was identified? What did you observe? Who was informed? What immediate protective actions were taken? Note: do not include names of other children.",
}

const DEFAULT_PLACEHOLDER =
  "What did you observe? What might the child have been communicating? How did you respond with empathy?"

function formatEventDateTime(value?: string | null): string {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function uniqueByValue<T extends { value: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const unique: T[] = []
  for (const item of items) {
    if (seen.has(item.value)) continue
    seen.add(item.value)
    unique.push(item)
  }
  return unique
}

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
  const [entityType, setEntityType] = useState<EntityType | "">("")
  const [entityId, setEntityId] = useState("")
  const [noteDate, setNoteDate] = useState(() => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  })
  const [category, setCategory] = useState<DailyLogCategory | "">("")
  const [triggerTaskFormKey, setTriggerTaskFormKey] = useState("")
  const [selectedFormId, setSelectedFormId] = useState("")
  const [note, setNote] = useState("")
  const [promptResponses, setPromptResponses] = useState<Record<string, string>>({})
  const [formFieldValues, setFormFieldValues] = useState<Record<string, unknown>>({})
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
    isActive: true,
  })
  const vehiclesQuery = useVehicleList({
    page: 1,
    pageSize: 100,
    isActive: true,
  })
  const employeesQuery = useEmployeeList({
    page: 1,
    pageSize: 100,
    isActive: true,
  })
  const eventsQuery = useCalendarEvents({
    homeId: homeId || undefined,
    page: 1,
    pageSize: 100,
  })
  const formsQuery = useFormList({ page: 1, pageSize: 100, status: "released" })
  const formDetailQuery = useFormDetail(selectedFormId, Boolean(selectedFormId))
  const reflectivePromptsQuery = useReflectivePrompts(Boolean(category))

  const homes = useMemo(() => homesQuery.data?.items ?? [], [homesQuery.data?.items])
  const youngPeople = useMemo(
    () => youngPeopleQuery.data?.items ?? [],
    [youngPeopleQuery.data?.items]
  )
  const vehicles = useMemo(() => vehiclesQuery.data?.items ?? [], [vehiclesQuery.data?.items])
  const employees = useMemo(() => employeesQuery.data?.items ?? [], [employeesQuery.data?.items])
  const events = useMemo(() => eventsQuery.data?.items ?? [], [eventsQuery.data?.items])
  const forms = useMemo(() => formsQuery.data?.items ?? [], [formsQuery.data?.items])
  const selectedEntityTypeLabel = ENTITY_TYPES.find((t) => t.value === entityType)?.label ?? "Related Item"
  const entityPlaceholder = entityType
    ? `Select ${selectedEntityTypeLabel.toLowerCase()}...`
    : "Pick a type first"

  // Build entity options based on selected entity type
  const entityOptions = useMemo(() => {
    if (!entityType) return []

    const normalizedHomeId = homeId.trim()

    switch (entityType) {
      case "young_person": {
        const sortedYoungPeople = [...youngPeople].sort((a, b) => {
          const aInSelectedHome = normalizedHomeId && (a.homeId ?? "").trim() === normalizedHomeId ? 0 : 1
          const bInSelectedHome = normalizedHomeId && (b.homeId ?? "").trim() === normalizedHomeId ? 0 : 1
          if (aInSelectedHome !== bInSelectedHome) return aInSelectedHome - bInSelectedHome
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        })

        return uniqueByValue(sortedYoungPeople.map((yp) => ({
          value: yp.id,
          label: (() => {
            const fullName = `${yp.firstName ?? ""} ${yp.lastName ?? ""}`.trim() || `Young Person ${yp.id}`
            const homeSuffix = yp.homeName ? ` (${yp.homeName})` : ""
            return `${fullName}${homeSuffix}`
          })(),
        })))
      }
      case "vehicle": {
        const sortedVehicles = [...vehicles].sort((a, b) => {
          const aInSelectedHome = normalizedHomeId && (a.homeId ?? "").trim() === normalizedHomeId ? 0 : 1
          const bInSelectedHome = normalizedHomeId && (b.homeId ?? "").trim() === normalizedHomeId ? 0 : 1
          if (aInSelectedHome !== bInSelectedHome) return aInSelectedHome - bInSelectedHome
          return `${a.make ?? ""} ${a.model ?? ""}`.trim().localeCompare(`${b.make ?? ""} ${b.model ?? ""}`.trim())
        })

        return uniqueByValue(sortedVehicles.map((vehicle) => {
          const primaryLabel =
            vehicle.name
            || `${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim()
            || vehicle.registration
            || `Vehicle ${vehicle.id}`
          const meta = [vehicle.registration, vehicle.homeName].filter(Boolean).join(" — ")
          return {
            value: vehicle.id,
            label: meta ? `${primaryLabel} (${meta})` : primaryLabel,
          }
        }))
      }
      case "employee":
        return uniqueByValue(employees.map((e) => {
          const firstName = e.user?.firstName ?? e.firstName ?? ""
          const lastName = e.user?.lastName ?? e.lastName ?? ""
          const fullName = `${firstName} ${lastName}`.trim()
          const fallbackName = e.user?.name ?? e.email ?? `Staff ${e.id}`
          const homeSuffix = e.homeName ? ` (${e.homeName})` : ""
          return {
          value: e.id,
          label: `${fullName || fallbackName}${homeSuffix}`,
        }
        }))
      case "home_event":
        return uniqueByValue(events.map((ev) => {
          const dateLabel = formatEventDateTime(ev.startAt)
          const typeLabel = ev.type ? ` • ${ev.type}` : ""
          return {
          value: ev.id,
          label: `${ev.title}${dateLabel ? ` — ${dateLabel}` : ""}${typeLabel}`,
          }
        }))
      default:
        return []
    }
  }, [entityType, youngPeople, vehicles, employees, events, homeId])

  // Form schema fields grouped by section
  const formSections = useMemo(() => {
    if (!formDetailQuery.data?.builder) return []
    const { sections, fields } = formDetailQuery.data.builder
    if (!sections?.length || !fields?.length) return []

    return sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        ...section,
        fields: fields
          .filter((f) => f.sectionId === section.id)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((s) => s.fields.length > 0)
  }, [formDetailQuery.data])

  // Filter prompts matching the current category
  const activePrompts = useMemo(() => {
    if (!category || !reflectivePromptsQuery.data) return []
    return (reflectivePromptsQuery.data.prompts ?? [])
      .filter((p) => p.category.toLowerCase() === category.toLowerCase() || p.category === "*")
      .sort((a, b) => a.order - b.order)
  }, [category, reflectivePromptsQuery.data])

  function handleHomeChange(value: string) {
    setHomeId(value)
    setEntityId("")
  }

  function handleEntityTypeChange(value: string) {
    if (value === RELATES_TO_NONE) {
      setEntityType("")
      setEntityId("")
      return
    }

    setEntityType(value as EntityType)
    setEntityId("")
  }

  function handleCategoryChange(value: string) {
    setCategory(value as DailyLogCategory)
  }

  function handleTriggerTaskChange(value: string) {
    if (value === "none") {
      setTriggerTaskFormKey("")
      setSelectedFormId("")
      setFormFieldValues({})
    } else {
      setTriggerTaskFormKey(value)
      const form = forms.find((f) => f.key === value)
      setSelectedFormId(form?.id ?? "")
      setFormFieldValues({})
    }
  }

  function setFormFieldValue(fieldId: string, value: unknown) {
    setFormFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  function getDefaultNoteDate(): string {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  function resetForm() {
    setHomeId("")
    setEntityType("")
    setEntityId("")
    setNoteDate(getDefaultNoteDate())
    setCategory("")
    setTriggerTaskFormKey("")
    setSelectedFormId("")
    setNote("")
    setPromptResponses({})
    setFormFieldValues({})
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
    if (!noteDate) { setError("Please set a date and time."); return }
    if (!category) { setError("Please select a category."); return }
    if (entityType && !entityId) {
      setError("Please select who or what this log relates to, or choose None.")
      return
    }

    const parsedNoteDate = new Date(noteDate)
    if (Number.isNaN(parsedNoteDate.getTime())) {
      setError("Please provide a valid date and time.")
      return
    }

    const normalizedNote = note.trim()
    if (!normalizedNote) {
      setError("Please enter the daily log content.")
      return
    }

    if (normalizedNote.length > 10000) {
      setError("Daily log content must be 10,000 characters or fewer.")
      return
    }

    const payload: CreateDailyLogPayload = {
      homeId,
      noteDate: parsedNoteDate.toISOString(),
      category,
      note: normalizedNote,
    }

    if (entityType && entityId) {
      payload.relatesTo = { type: entityType, id: entityId }
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

          {/* 2. Relates To — entity type picker + entity picker */}
          {homeId && (
            <div className="space-y-1.5">
            <Label className="text-sm">Relates To</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={entityType} onValueChange={handleEntityTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Entity type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RELATES_TO_NONE}>None</SelectItem>
                    {ENTITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{selectedEntityTypeLabel}</Label>
                <Select
                  value={entityId}
                  onValueChange={setEntityId}
                  disabled={!entityType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={entityPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {entityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                    {entityOptions.length === 0 && entityType && (
                      <SelectItem value="_empty" disabled>
                        No {selectedEntityTypeLabel.toLowerCase()} found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          )}

          {/* 3. Date & Category (side by side) */}
          {homeId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Select value={category} onValueChange={handleCategoryChange}>
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
          {homeId && category && (
            <div className="space-y-1.5">
              <Label className="text-sm">Trigger Task</Label>
              <Select
                value={triggerTaskFormKey || "none"}
                onValueChange={handleTriggerTaskChange}
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

          {/* 4b. Dynamic form fields from selected template */}
          {selectedFormId && formDetailQuery.isLoading && (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {selectedFormId && formSections.length > 0 && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              {formSections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">{section.title}</p>
                  {section.description && (
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  )}
                  {section.fields.map((field) => (
                    <DynamicFormField
                      key={field.id}
                      field={field}
                      value={formFieldValues[field.id]}
                      onChange={(val) => setFormFieldValue(field.id, val)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* 5. Reflective prompts (loaded from BE) */}
          {homeId && category && activePrompts.length > 0 && (
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium text-primary">
                Reflective Prompts
              </p>
              <p className="text-xs text-muted-foreground">
                Take a moment to reflect before recording. These questions help
                support therapeutic thinking.
              </p>
              {activePrompts.map((prompt) => (
                <div key={prompt.id} className="space-y-1">
                  <Label className="text-sm font-normal italic">
                    {prompt.prompt}
                  </Label>
                  {prompt.helpText && (
                    <p className="text-xs text-muted-foreground">{prompt.helpText}</p>
                  )}
                  <Textarea
                    value={promptResponses[prompt.id] ?? ""}
                    onChange={(e) =>
                      setPromptResponses((prev) => ({ ...prev, [prompt.id]: e.target.value }))
                    }
                    placeholder="Your reflection..."
                    className="min-h-[60px] resize-y text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {homeId && category && reflectivePromptsQuery.isLoading && (
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {/* 6. Daily Log content */}
          {homeId && category && (
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-sm">
                Daily Log <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={CATEGORY_PLACEHOLDERS[category] ?? DEFAULT_PLACEHOLDER}
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

// ─── Dynamic Form Field Renderer ────────────────────────────────

interface DynamicFormFieldProps {
  field: {
    id: string
    type: string
    label: string
    placeholder?: string
    helpText?: string
    required: boolean
    options?: Array<{ value: string; label: string }>
    validation?: { min?: number; max?: number; minLength?: number; maxLength?: number }
  }
  value: unknown
  onChange: (value: unknown) => void
}

function DynamicFormField({ field, value, onChange }: DynamicFormFieldProps) {
  const label = (
    <Label className="text-sm">
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
  )

  const helpText = field.helpText ? (
    <p className="text-xs text-muted-foreground">{field.helpText}</p>
  ) : null

  switch (field.type) {
    case "text":
    case "single_line_text_input":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.validation?.maxLength}
          />
        </div>
      )

    case "textarea":
    case "multi_line_text_input":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[80px] resize-y text-sm"
            maxLength={field.validation?.maxLength}
          />
        </div>
      )

    case "number":
    case "numeric_input":
    case "currency":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Input
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        </div>
      )

    case "date":
    case "date_input":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Input
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )

    case "datetime":
    case "time_input":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Input
            type={field.type === "time_input" ? "time" : "datetime-local"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )

    case "select":
    case "dropdown_select_list":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Select value={(value as string) ?? ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder ?? "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case "radio":
    case "radio_buttons":
    case "yes_or_no": {
      const options =
        field.type === "yes_or_no"
          ? [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]
          : field.options ?? []

      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <RadioGroup
            value={(value as string) ?? ""}
            onValueChange={onChange}
            className="flex flex-wrap gap-4"
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
                <Label htmlFor={`${field.id}-${opt.value}`} className="text-sm font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )
    }

    case "checkbox":
    case "checkbox_list":
    case "multi_select": {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <div className="flex flex-wrap gap-3">
            {(field.options ?? []).map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${opt.value}`}
                  checked={selected.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selected, opt.value])
                    } else {
                      onChange(selected.filter((v) => v !== opt.value))
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${opt.value}`} className="text-sm font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case "file":
    case "embed_files":
    case "signature":
    case "signature_image":
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <div className="rounded-md border border-dashed border-gray-300 bg-white p-3 text-center text-xs text-muted-foreground">
            {field.type === "signature" || field.type === "signature_image"
              ? "Signature capture available after task creation."
              : "File upload available after task creation."}
          </div>
        </div>
      )

    default:
      return (
        <div className="space-y-1">
          {label}
          {helpText}
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      )
  }
}
