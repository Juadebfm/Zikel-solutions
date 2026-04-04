"use client"

import { useCallback, useMemo, useState } from "react"
import { format } from "date-fns"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useRotaList,
  useCreateRota,
  useDeleteRota,
  useRotaTemplates,
} from "@/hooks/api/use-scheduling"
import type {
  CalendarEvent,
  CalendarEventType,
  CreateCalendarEventPayload,
  Rota,
  RotaShift,
} from "@/services/scheduling.service"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy, HH:mm")
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "dd MMM yyyy")
}

const eventTypeConfig: Record<CalendarEventType, { label: string; bg: string; text: string }> = {
  shift: { label: "Shift", bg: "bg-blue-100", text: "text-blue-700" },
  appointment: { label: "Appointment", bg: "bg-purple-100", text: "text-purple-700" },
  meeting: { label: "Meeting", bg: "bg-amber-100", text: "text-amber-700" },
  deadline: { label: "Deadline", bg: "bg-red-100", text: "text-red-700" },
  other: { label: "Other", bg: "bg-gray-100", text: "text-gray-700" },
}

const EVENT_TYPES: CalendarEventType[] = ["shift", "appointment", "meeting", "deadline", "other"]

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// ─── Page ───────────────────────────────────────────────────────

export default function SchedulingPage() {
  const [activeTab, setActiveTab] = useState("calendar")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Scheduling
        </h1>
        <p className="text-gray-500 mt-1">
          Scheduling helps ensure consistent, reliable care for every child.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="rotas">Rotas</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarTab />
        </TabsContent>

        <TabsContent value="rotas" className="mt-6">
          <RotasTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Calendar Tab ───────────────────────────────────────────────

function CalendarTab() {
  const [homeId, setHomeId] = useState("")
  const [eventType, setEventType] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const homesQuery = useHomesDropdown()
  const pageSizeNum = parseInt(pageSize)

  const eventsQuery = useCalendarEvents({
    homeId: homeId || undefined,
    type: (eventType as CalendarEventType) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: pageSizeNum,
  })

  const deleteMutation = useDeleteCalendarEvent()

  const events = eventsQuery.data?.items ?? []
  const meta = eventsQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)

  const handleDelete = useCallback(
    (id: string) => {
      setProcessingIds((prev) => new Set([...prev, id]))
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast("Event deleted.")
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete event.")
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
      })
      setDeleteConfirm(null)
    },
    [deleteMutation, showError, showToast]
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={(v) => { setHomeId(v === "all" ? "" : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="All homes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All homes</SelectItem>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={(v) => { setEventType(v === "all" ? "" : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{eventTypeConfig[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} />
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions bar */}
      <div className="flex items-center justify-end">
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 min-w-[180px]">Title</TableHead>
              <TableHead className="font-semibold text-gray-700">Type</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Home</TableHead>
              <TableHead className="font-semibold text-gray-700">Start</TableHead>
              <TableHead className="font-semibold text-gray-700">End</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Attendees</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p>No events scheduled for this period.</p>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event, index) => {
                const isProcessing = processingIds.has(event.id)
                const typeConf = eventTypeConfig[event.type] ?? eventTypeConfig.other

                if (isProcessing) {
                  return (
                    <TableRow key={event.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                }

                return (
                  <TableRow key={event.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-gray-400 line-clamp-1">{event.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${typeConf.bg} ${typeConf.text}`}>{typeConf.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-gray-600">
                      {event.homeName ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                      {event.allDay ? formatShortDate(event.startAt) : formatDate(event.startAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                      {event.allDay ? formatShortDate(event.endAt) : formatDate(event.endAt)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {event.attendeeNames && event.attendeeNames.length > 0
                        ? event.attendeeNames.length <= 2
                          ? event.attendeeNames.join(", ")
                          : `${event.attendeeNames.slice(0, 2).join(", ")} +${event.attendeeNames.length - 2}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() => setEditEvent(event)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteConfirm(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!eventsQuery.isLoading && events.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 pb-4">
          <div className="flex items-center gap-3">
            <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(1) }}>
              <SelectTrigger className="w-16 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-gray-500">per page</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span className="px-2 py-1 border rounded text-center min-w-8">{page}</span>
              <span className="text-gray-500">of {totalPages}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Event Dialog */}
      <EventFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
      />

      {/* Edit Event Dialog */}
      <EventFormDialog
        open={editEvent !== null}
        onClose={() => setEditEvent(null)}
        mode="edit"
        event={editEvent ?? undefined}
      />

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Event Form Dialog ──────────────────────────────────────────

function EventFormDialog({
  open,
  onClose,
  mode,
  event,
}: {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  event?: CalendarEvent
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<CalendarEventType>("meeting")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [homeId, setHomeId] = useState("")
  const [allDay, setAllDay] = useState(false)

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)
  const homesQuery = useHomesDropdown()
  const createMutation = useCreateCalendarEvent()
  const updateMutation = useUpdateCalendarEvent()

  const isPending = createMutation.isPending || updateMutation.isPending

  // Populate form when editing
  const populateForm = useCallback(() => {
    if (mode === "edit" && event) {
      setTitle(event.title)
      setDescription(event.description ?? "")
      setType(event.type)
      setAllDay(event.allDay)
      setHomeId(event.homeId ?? "")
      const start = new Date(event.startAt)
      const end = new Date(event.endAt)
      if (!Number.isNaN(start.getTime())) {
        setStartDate(format(start, "yyyy-MM-dd"))
        setStartTime(format(start, "HH:mm"))
      }
      if (!Number.isNaN(end.getTime())) {
        setEndDate(format(end, "yyyy-MM-dd"))
        setEndTime(format(end, "HH:mm"))
      }
    } else {
      setTitle("")
      setDescription("")
      setType("meeting")
      setStartDate("")
      setStartTime("")
      setEndDate("")
      setEndTime("")
      setHomeId("")
      setAllDay(false)
    }
  }, [mode, event])

  // Reset form on open/close
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) populateForm()
      if (!isOpen) onClose()
    },
    [onClose, populateForm]
  )

  // We also populate on first open
  useMemo(() => {
    if (open) populateForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      showError("Please enter a title.")
      return
    }
    if (!startDate) {
      showError("Please select a start date.")
      return
    }
    if (!endDate) {
      showError("Please select an end date.")
      return
    }

    const startAt = allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime || "00:00"}:00`
    const endAt = allDay ? `${endDate}T23:59:59` : `${endDate}T${endTime || "23:59"}:00`

    if (mode === "create") {
      const payload: CreateCalendarEventPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startAt,
        endAt,
        homeId: homeId || undefined,
        allDay,
      }
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast("Event created successfully.")
          onClose()
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to create event.")
        },
      })
    } else if (event) {
      updateMutation.mutate(
        {
          id: event.id,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            startAt,
            endAt,
            homeId: homeId || undefined,
            allDay,
          },
        },
        {
          onSuccess: () => {
            showToast("Event updated successfully.")
            onClose()
          },
          onError: (err) => {
            showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update event.")
          },
        }
      )
    }
  }, [
    title, description, type, startDate, startTime, endDate, endTime, homeId, allDay,
    mode, event, createMutation, updateMutation, showError, showToast, onClose,
  ])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-0 bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Event" : "Edit Event"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new calendar event to help coordinate care."
              : "Update the event details."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{eventTypeConfig[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={(v) => setHomeId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={allDay} onCheckedChange={setAllDay} id="all-day" />
            <Label htmlFor="all-day">All day</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancel</Button>
          <Button className="rounded-lg" disabled={isPending} onClick={handleSubmit}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Rotas Tab ──────────────────────────────────────────────────

function RotasTab() {
  const [homeId, setHomeId] = useState("")
  const [weekStarting, setWeekStarting] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState("20")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const homesQuery = useHomesDropdown()
  const pageSizeNum = parseInt(pageSize)

  const rotasQuery = useRotaList({
    homeId: homeId || undefined,
    weekStarting: weekStarting || undefined,
    page,
    pageSize: pageSizeNum,
  })

  const deleteMutation = useDeleteRota()
  const templatesQuery = useRotaTemplates()

  const rotas = rotasQuery.data?.items ?? []
  const meta = rotasQuery.data?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)

  const handleDelete = useCallback(
    (id: string) => {
      setProcessingIds((prev) => new Set([...prev, id]))
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast("Rota deleted.")
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to delete rota.")
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
      })
      setDeleteConfirm(null)
    },
    [deleteMutation, showError, showToast]
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Rotas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={(v) => { setHomeId(v === "all" ? "" : v); setPage(1) }}>
                <SelectTrigger><SelectValue placeholder="All homes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All homes</SelectItem>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Week Starting</Label>
              <Input type="date" value={weekStarting} onChange={(e) => { setWeekStarting(e.target.value); setPage(1) }} />
            </div>

            <div className="space-y-2">
              <Label>Apply Template</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
                <SelectContent>
                  {(templatesQuery.data ?? []).length === 0 ? (
                    <SelectItem value="_empty" disabled>No templates available</SelectItem>
                  ) : (
                    (templatesQuery.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions bar */}
      <div className="flex items-center justify-end">
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Rota
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Home</TableHead>
              <TableHead className="font-semibold text-gray-700">Week Starting</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden sm:table-cell">Shifts</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Staff</TableHead>
              <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Created</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotasQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rotas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p>No rotas configured for this period.</p>
                </TableCell>
              </TableRow>
            ) : (
              rotas.map((rota, index) => {
                const isProcessing = processingIds.has(rota.id)

                if (isProcessing) {
                  return (
                    <TableRow key={rota.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full max-w-[120px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                }

                const uniqueStaff = new Set(rota.shifts.map((s) => s.employeeName ?? s.employeeId))
                const shiftSummary = rota.shifts.length

                return (
                  <TableRow key={rota.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <TableCell className="text-sm font-medium text-gray-900">
                      {rota.homeName ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                      {formatShortDate(rota.weekStarting)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-gray-600">
                      {shiftSummary} shift{shiftSummary !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {uniqueStaff.size} staff
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-400 whitespace-nowrap">
                      {formatShortDate(rota.createdAt)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteConfirm(rota.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!rotasQuery.isLoading && rotas.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 pb-4">
          <div className="flex items-center gap-3">
            <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(1) }}>
              <SelectTrigger className="w-16 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-gray-500">per page</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-sm">
              <span className="px-2 py-1 border rounded text-center min-w-8">{page}</span>
              <span className="text-gray-500">of {totalPages}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Rota Dialog */}
      <RotaFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle>Delete Rota</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rota? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Rota Form Dialog ───────────────────────────────────────────

function RotaFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [homeId, setHomeId] = useState("")
  const [weekStarting, setWeekStarting] = useState("")
  const [shifts, setShifts] = useState<Omit<RotaShift, "employeeName">[]>([
    { employeeId: "", dayOfWeek: 0, startTime: "09:00", endTime: "17:00", role: "" },
  ])

  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)
  const homesQuery = useHomesDropdown()
  const createMutation = useCreateRota()

  const resetForm = useCallback(() => {
    setHomeId("")
    setWeekStarting("")
    setShifts([{ employeeId: "", dayOfWeek: 0, startTime: "09:00", endTime: "17:00", role: "" }])
  }, [])

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) resetForm()
      if (!isOpen) onClose()
    },
    [onClose, resetForm]
  )

  const updateShift = useCallback((index: number, field: keyof Omit<RotaShift, "employeeName">, value: string | number) => {
    setShifts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }, [])

  const addShift = useCallback(() => {
    setShifts((prev) => [...prev, { employeeId: "", dayOfWeek: 0, startTime: "09:00", endTime: "17:00", role: "" }])
  }, [])

  const removeShift = useCallback((index: number) => {
    setShifts((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!homeId) {
      showError("Please select a home.")
      return
    }
    if (!weekStarting) {
      showError("Please select a week starting date.")
      return
    }

    const validShifts = shifts.filter((s) => s.employeeId && s.role)
    if (validShifts.length === 0) {
      showError("Please add at least one shift with an employee ID and role.")
      return
    }

    createMutation.mutate(
      { homeId, weekStarting, shifts: validShifts },
      {
        onSuccess: () => {
          showToast("Rota created successfully.")
          onClose()
        },
        onError: (err) => {
          showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to create rota.")
        },
      }
    )
  }, [homeId, weekStarting, shifts, createMutation, showError, showToast, onClose])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl border-0 bg-white shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Rota</DialogTitle>
          <DialogDescription>
            Define shifts for a week to ensure consistent staffing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Home</Label>
              <Select value={homeId} onValueChange={setHomeId}>
                <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
                <SelectContent>
                  {(homesQuery.data ?? []).map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Week Starting</Label>
              <Input type="date" value={weekStarting} onChange={(e) => setWeekStarting(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Shifts</Label>
              <Button variant="outline" size="sm" className="gap-1" onClick={addShift}>
                <Plus className="h-3 w-3" /> Add Shift
              </Button>
            </div>

            {shifts.map((shift, index) => (
              <Card key={index}>
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">Shift {index + 1}</p>
                    {shifts.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => removeShift(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Employee ID</Label>
                      <Input
                        value={shift.employeeId}
                        onChange={(e) => updateShift(index, "employeeId", e.target.value)}
                        placeholder="Employee ID"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input
                        value={shift.role}
                        onChange={(e) => updateShift(index, "role", e.target.value)}
                        placeholder="e.g. Senior Carer"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Day</Label>
                      <Select
                        value={String(shift.dayOfWeek)}
                        onValueChange={(v) => updateShift(index, "dayOfWeek", parseInt(v))}
                      >
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DAY_NAMES.map((d, i) => (
                            <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => updateShift(index, "startTime", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => updateShift(index, "endTime", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancel</Button>
          <Button className="rounded-lg" disabled={createMutation.isPending} onClick={handleSubmit}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Rota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
