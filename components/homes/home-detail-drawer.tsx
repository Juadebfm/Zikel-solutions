"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useHomeById, useUpdateHome } from "@/hooks/api/use-homes"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

// ─── Constants ──────────────────────────────────────────────────

const STATUS_BADGES: Record<string, string> = {
  current: "bg-green-100 text-green-700 border-green-200",
  past: "bg-gray-100 text-gray-600 border-gray-200",
  planned: "bg-blue-100 text-blue-700 border-blue-200",
}

// ─── Types ──────────────────────────────────────────────────────

interface HomeDetailDrawerProps {
  homeId: string | null
  open: boolean
  onClose: () => void
}

interface FormState {
  name: string
  description: string
  address: string
  postCode: string
  capacity: string
  category: string
  region: string
  status: string
  phoneNumber: string
  email: string
  ofstedUrn: string
  minAgeGroup: string
  maxAgeGroup: string
  isSecure: boolean
  shortTermStays: boolean
  startDate: string
  endDate: string
}

// ─── Component ──────────────────────────────────────────────────

export function HomeDetailDrawer({ homeId, open, onClose }: HomeDetailDrawerProps) {
  const { data: home, isLoading } = useHomeById(homeId)
  const updateMutation = useUpdateHome()
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: "", description: "", address: "", postCode: "",
    capacity: "", category: "", region: "", status: "current",
    phoneNumber: "", email: "", ofstedUrn: "",
    minAgeGroup: "", maxAgeGroup: "",
    isSecure: false, shortTermStays: false,
    startDate: "", endDate: "",
  })

  useEffect(() => {
    if (home) {
      setForm({
        name: home.name ?? "",
        description: home.description ?? "",
        address: home.address ?? "",
        postCode: home.postCode ?? "",
        capacity: home.capacity != null ? String(home.capacity) : "",
        category: home.category ?? "",
        region: home.region ?? "",
        status: home.status ?? "current",
        phoneNumber: home.phoneNumber ?? home.phone ?? "",
        email: home.email ?? "",
        ofstedUrn: home.ofstedUrn ?? "",
        minAgeGroup: home.minAgeGroup != null ? String(home.minAgeGroup) : "",
        maxAgeGroup: home.maxAgeGroup != null ? String(home.maxAgeGroup) : "",
        isSecure: home.isSecure ?? false,
        shortTermStays: home.shortTermStays ?? false,
        startDate: home.startDate ? home.startDate.slice(0, 10) : "",
        endDate: home.endDate ? home.endDate.slice(0, 10) : "",
      })
    }
  }, [home])

  function handleClose() {
    setIsEditing(false)
    onClose()
  }

  function handleCancel() {
    if (home) {
      setForm({
        name: home.name ?? "",
        description: home.description ?? "",
        address: home.address ?? "",
        postCode: home.postCode ?? "",
        capacity: home.capacity != null ? String(home.capacity) : "",
        category: home.category ?? "",
        region: home.region ?? "",
        status: home.status ?? "current",
        phoneNumber: home.phoneNumber ?? home.phone ?? "",
        email: home.email ?? "",
        ofstedUrn: home.ofstedUrn ?? "",
        minAgeGroup: home.minAgeGroup != null ? String(home.minAgeGroup) : "",
        maxAgeGroup: home.maxAgeGroup != null ? String(home.maxAgeGroup) : "",
        isSecure: home.isSecure ?? false,
        shortTermStays: home.shortTermStays ?? false,
        startDate: home.startDate ? home.startDate.slice(0, 10) : "",
        endDate: home.endDate ? home.endDate.slice(0, 10) : "",
      })
    }
    setIsEditing(false)
  }

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!homeId || !form.name.trim()) {
      showError("Home name is required.")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: homeId,
        input: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          address: form.address.trim() || undefined,
          postCode: form.postCode.trim() || undefined,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          category: form.category.trim() || undefined,
          region: form.region.trim() || undefined,
          status: form.status || undefined,
          phoneNumber: form.phoneNumber.trim() || undefined,
          email: form.email.trim() || undefined,
          ofstedUrn: form.ofstedUrn.trim() || undefined,
          minAgeGroup: form.minAgeGroup ? Number(form.minAgeGroup) : null,
          maxAgeGroup: form.maxAgeGroup ? Number(form.maxAgeGroup) : null,
          isSecure: form.isSecure,
          shortTermStays: form.shortTermStays,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        },
      })
      showToast("Home updated.")
      setIsEditing(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update home.")
    }
  }

  const adminName = home?.admin?.name ?? home?.manager ?? null
  const picName = home?.personInCharge?.name ?? null
  const riName = home?.responsibleIndividual?.name ?? null
  const youngPeopleCount = home?.counts?.youngPeople ?? home?.currentOccupancy ?? 0
  const occupancyLabel = home?.capacity ? `${youngPeopleCount} / ${home.capacity}` : String(youngPeopleCount)
  const statusBadge = STATUS_BADGES[home?.status ?? ""] ?? STATUS_BADGES.current

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-lg truncate">
              {isLoading ? <Skeleton className="h-6 w-48" /> : home?.name ?? "Home"}
            </SheetTitle>
            {home && (
              <Badge variant="outline" className={`shrink-0 capitalize ${statusBadge}`}>
                {home.status}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : home ? (
            <>
              {/* ─── Read mode ─── */}
              {!isEditing && (
                <div className="space-y-4">
                  <DetailRow label="Name" value={home.name} />
                  <DetailRow label="Category" value={home.category} />
                  <DetailRow label="Description" value={home.description} />
                  <DetailRow label="Care Group" value={home.careGroupName} />
                  <DetailRow label="Region" value={home.region} />

                  <Separator />
                  <SectionLabel>Key People</SectionLabel>
                  <DetailRow label="Administrator" value={adminName} />
                  <DetailRow label="Person in Charge" value={picName} />
                  <DetailRow label="Responsible Individual" value={riName} />

                  <Separator />
                  <SectionLabel>Contact</SectionLabel>
                  <DetailRow label="Phone" value={home.phoneNumber ?? home.phone} />
                  <DetailRow label="Email" value={home.email} />
                  <DetailRow label="Address" value={home.address} />
                  <DetailRow label="Postcode" value={home.postCode} />

                  <Separator />
                  <SectionLabel>Capacity & Residents</SectionLabel>
                  <DetailRow label="Capacity" value={home.capacity != null ? String(home.capacity) : null} />
                  <DetailRow label="Occupancy" value={occupancyLabel} />
                  <DetailRow label="Age Range" value={home.minAgeGroup != null && home.maxAgeGroup != null ? `${home.minAgeGroup} – ${home.maxAgeGroup}` : null} />
                  <DetailRow label="Secure" value={home.isSecure ? "Yes" : "No"} />
                  <DetailRow label="Short-Term Stays" value={home.shortTermStays ? "Yes" : "No"} />

                  <Separator />
                  <SectionLabel>Compliance</SectionLabel>
                  <DetailRow label="Ofsted URN" value={home.ofstedUrn} />
                  <DetailRow label="Start Date" value={formatDate(home.startDate)} />
                  <DetailRow label="End Date" value={formatDate(home.endDate)} />

                  <Separator />
                  <SectionLabel>Stats</SectionLabel>
                  <DetailRow label="Employees" value={String(home.counts?.employees ?? 0)} />
                  <DetailRow label="Young People" value={String(home.counts?.youngPeople ?? 0)} />
                  <DetailRow label="Vehicles" value={String(home.counts?.vehicles ?? 0)} />
                  <DetailRow label="Tasks" value={String(home.counts?.tasks ?? 0)} />
                </div>
              )}

              {/* ─── Edit mode ─── */}
              {isEditing && (
                <div className="space-y-4">
                  <Field label="Name" required value={form.name} onChange={(v) => handleChange("name", v)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Category" value={form.category} onChange={(v) => handleChange("category", v)} placeholder="e.g. Residential" />
                    <Field label="Region" value={form.region} onChange={(v) => handleChange("region", v)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Description</Label>
                    <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="min-h-[80px] resize-y" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Status</Label>
                    <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  <SectionLabel>Contact</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Phone" value={form.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} />
                    <Field label="Email" value={form.email} onChange={(v) => handleChange("email", v)} type="email" />
                  </div>
                  <Field label="Address" value={form.address} onChange={(v) => handleChange("address", v)} />
                  <Field label="Postcode" value={form.postCode} onChange={(v) => handleChange("postCode", v)} />

                  <Separator />
                  <SectionLabel>Capacity & Residents</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Capacity" value={form.capacity} onChange={(v) => handleChange("capacity", v)} type="number" />
                    <Field label="Ofsted URN" value={form.ofstedUrn} onChange={(v) => handleChange("ofstedUrn", v)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Min Age" value={form.minAgeGroup} onChange={(v) => handleChange("minAgeGroup", v)} type="number" />
                    <Field label="Max Age" value={form.maxAgeGroup} onChange={(v) => handleChange("maxAgeGroup", v)} type="number" />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm">Secure Home</Label>
                    <Switch checked={form.isSecure} onCheckedChange={(v) => handleChange("isSecure", v)} />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm">Short-Term Stays</Label>
                    <Switch checked={form.shortTermStays} onCheckedChange={(v) => handleChange("shortTermStays", v)} />
                  </div>

                  <Separator />
                  <SectionLabel>Dates</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Start Date" value={form.startDate} onChange={(v) => handleChange("startDate", v)} type="date" />
                    <Field label="End Date" value={form.endDate} onChange={(v) => handleChange("endDate", v)} type="date" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-10">Home not found.</p>
          )}
        </div>

        <Separator />

        <div className="px-6 py-4 flex items-center justify-end gap-2 bg-gray-50/50">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>Close</Button>
              <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Helpers ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</p>
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right font-medium">{value?.trim() || "-"}</span>
    </div>
  )
}

function Field({ label, value, onChange, required, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void
  required?: boolean; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function formatDate(value?: string | null): string {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
