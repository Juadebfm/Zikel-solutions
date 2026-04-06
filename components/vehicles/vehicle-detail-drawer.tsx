"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useVehicleById, useUpdateVehicle } from "@/hooks/api/use-vehicles"
import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

interface VehicleDetailDrawerProps {
  vehicleId: string | null
  open: boolean
  onClose: () => void
}

function toDateInput(iso?: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

function toISO(dateStr: string): string | undefined {
  if (!dateStr) return undefined
  return new Date(dateStr).toISOString()
}

function formatDate(value?: string | null): string {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function VehicleDetailDrawer({ vehicleId, open, onClose }: VehicleDetailDrawerProps) {
  const { data: vehicle, isLoading } = useVehicleById(vehicleId)
  const updateMutation = useUpdateVehicle()
  const homesQuery = useHomesDropdown()
  const homes = useMemo(() => homesQuery.data ?? [], [homesQuery.data])
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    registration: "", make: "", model: "", year: "", colour: "",
    description: "", vin: "", status: "current", fuelType: "", ownership: "",
    mileage: "", homeId: "", contactPhone: "",
    registrationDate: "", taxDate: "", insuranceDate: "",
    motDue: "", nextServiceDue: "", startDate: "", endDate: "",
    leaseStartDate: "", leaseEndDate: "",
    purchasePrice: "", purchaseDate: "",
  })

  useEffect(() => {
    if (vehicle) {
      setForm({
        registration: vehicle.registration ?? "",
        make: vehicle.make ?? "",
        model: vehicle.model ?? "",
        year: vehicle.year != null ? String(vehicle.year) : "",
        colour: vehicle.colour ?? "",
        description: vehicle.description ?? "",
        vin: vehicle.vin ?? "",
        status: vehicle.status ?? "current",
        fuelType: vehicle.fuelType ?? "",
        ownership: vehicle.ownership ?? "",
        mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
        homeId: vehicle.homeId ?? "",
        contactPhone: vehicle.contactPhone ?? "",
        registrationDate: toDateInput(vehicle.registrationDate),
        taxDate: toDateInput(vehicle.taxDate),
        insuranceDate: toDateInput(vehicle.insuranceDate),
        motDue: toDateInput(vehicle.motDue),
        nextServiceDue: toDateInput(vehicle.nextServiceDue),
        startDate: toDateInput(vehicle.startDate),
        endDate: toDateInput(vehicle.endDate),
        leaseStartDate: toDateInput(vehicle.leaseStartDate),
        leaseEndDate: toDateInput(vehicle.leaseEndDate),
        purchasePrice: vehicle.purchasePrice != null ? String(vehicle.purchasePrice) : "",
        purchaseDate: toDateInput(vehicle.purchaseDate),
      })
    }
  }, [vehicle])

  function handleClose() { setIsEditing(false); onClose() }
  function handleCancel() { if (vehicle) { /* re-sync from vehicle */ setForm((prev) => ({ ...prev })) }; setIsEditing(false) }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!vehicleId) return
    if (!form.registration.trim()) { showError("Registration is required."); return }

    try {
      await updateMutation.mutateAsync({
        id: vehicleId,
        input: {
          registration: form.registration.trim(),
          make: form.make.trim() || undefined,
          model: form.model.trim() || undefined,
          year: form.year ? Number(form.year) : undefined,
          colour: form.colour.trim() || undefined,
          description: form.description.trim() || undefined,
          vin: form.vin.trim() || undefined,
          status: form.status || undefined,
          fuelType: form.fuelType || undefined,
          ownership: form.ownership.trim() || undefined,
          mileage: form.mileage ? Number(form.mileage) : undefined,
          homeId: form.homeId || null,
          contactPhone: form.contactPhone.trim() || undefined,
          registrationDate: toISO(form.registrationDate),
          taxDate: toISO(form.taxDate),
          insuranceDate: toISO(form.insuranceDate),
          motDue: toISO(form.motDue),
          nextServiceDue: toISO(form.nextServiceDue),
          startDate: toISO(form.startDate),
          endDate: form.endDate ? toISO(form.endDate) : null,
          leaseStartDate: form.leaseStartDate ? toISO(form.leaseStartDate) : null,
          leaseEndDate: form.leaseEndDate ? toISO(form.leaseEndDate) : null,
          purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
          purchaseDate: form.purchaseDate ? toISO(form.purchaseDate) : null,
        },
      })
      showToast("Vehicle updated.")
      setIsEditing(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update vehicle.")
    }
  }

  const title = vehicle
    ? vehicle.name || `${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim() || vehicle.registration || "Vehicle"
    : "Vehicle"

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">
            {isLoading ? <Skeleton className="h-6 w-48" /> : title}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-1.5"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /></div>
              ))}
            </div>
          ) : vehicle ? (
            <>
              {/* ─── Read ─── */}
              {!isEditing && (
                <div className="space-y-4">
                  <SectionLabel>Vehicle Info</SectionLabel>
                  <Row label="Registration" value={vehicle.registration} />
                  <Row label="Make" value={vehicle.make} />
                  <Row label="Model" value={vehicle.model} />
                  <Row label="Year" value={vehicle.year != null ? String(vehicle.year) : null} />
                  <Row label="Colour" value={vehicle.colour} />
                  <Row label="VIN" value={vehicle.vin} />
                  <Row label="Description" value={vehicle.description} />
                  <Row label="Fuel Type" value={vehicle.fuelType} />
                  <Row label="Ownership" value={vehicle.ownership} />
                  <Row label="Status" value={vehicle.status} />
                  <Row label="Mileage" value={vehicle.mileage != null ? vehicle.mileage.toLocaleString() : null} />

                  <Separator />
                  <SectionLabel>Assignment</SectionLabel>
                  <Row label="Home" value={vehicle.homeName} />
                  <Row label="Responsible Person" value={vehicle.adminUser?.name} />
                  <Row label="Contact Phone" value={vehicle.contactPhone} />

                  <Separator />
                  <SectionLabel>Key Dates</SectionLabel>
                  <Row label="Registration Date" value={formatDate(vehicle.registrationDate)} />
                  <Row label="Tax Due" value={formatDate(vehicle.taxDate)} />
                  <Row label="Insurance Date" value={formatDate(vehicle.insuranceDate)} />
                  <Row label="MOT Due" value={formatDate(vehicle.motDue)} />
                  <Row label="Next Service" value={formatDate(vehicle.nextServiceDue)} />
                  <Row label="Start Date" value={formatDate(vehicle.startDate)} />
                  <Row label="End Date" value={formatDate(vehicle.endDate)} />

                  {(vehicle.ownership === "Leased" || vehicle.leaseStartDate || vehicle.leaseEndDate) && (
                    <>
                      <Separator />
                      <SectionLabel>Lease</SectionLabel>
                      <Row label="Lease Start" value={formatDate(vehicle.leaseStartDate)} />
                      <Row label="Lease End" value={formatDate(vehicle.leaseEndDate)} />
                    </>
                  )}

                  {(vehicle.ownership === "Purchased" || vehicle.purchasePrice || vehicle.purchaseDate) && (
                    <>
                      <Separator />
                      <SectionLabel>Purchase</SectionLabel>
                      <Row label="Purchase Price" value={vehicle.purchasePrice != null ? `£${vehicle.purchasePrice.toLocaleString()}` : null} />
                      <Row label="Purchase Date" value={formatDate(vehicle.purchaseDate)} />
                    </>
                  )}
                </div>
              )}

              {/* ─── Edit ─── */}
              {isEditing && (
                <div className="space-y-4">
                  <SectionLabel>Vehicle Info</SectionLabel>
                  <Field label="Registration" required value={form.registration} onChange={(v) => handleChange("registration", v)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Make" value={form.make} onChange={(v) => handleChange("make", v)} />
                    <Field label="Model" value={form.model} onChange={(v) => handleChange("model", v)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Year" value={form.year} onChange={(v) => handleChange("year", v)} type="number" />
                    <Field label="Colour" value={form.colour} onChange={(v) => handleChange("colour", v)} />
                  </div>
                  <Field label="VIN" value={form.vin} onChange={(v) => handleChange("vin", v)} placeholder="e.g. WF0XXXGCDX1234567" />
                  <div className="space-y-1.5">
                    <Label className="text-sm">Description</Label>
                    <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="min-h-[60px] resize-y" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Fuel Type</Label>
                      <Select value={form.fuelType} onValueChange={(v) => handleChange("fuelType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Ownership</Label>
                      <Select value={form.ownership} onValueChange={(v) => handleChange("ownership", v)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchased">Purchased</SelectItem>
                          <SelectItem value="Leased">Leased</SelectItem>
                          <SelectItem value="Hired">Hired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <Field label="Mileage" value={form.mileage} onChange={(v) => handleChange("mileage", v)} type="number" />
                  </div>

                  <Separator />
                  <SectionLabel>Assignment</SectionLabel>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Home</Label>
                    <Select value={form.homeId || "__none__"} onValueChange={(v) => handleChange("homeId", v === "__none__" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {homes.map((h) => (<SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Contact Phone" value={form.contactPhone} onChange={(v) => handleChange("contactPhone", v)} />

                  <Separator />
                  <SectionLabel>Key Dates</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Registration Date" value={form.registrationDate} onChange={(v) => handleChange("registrationDate", v)} type="date" />
                    <Field label="Tax Due" value={form.taxDate} onChange={(v) => handleChange("taxDate", v)} type="date" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Insurance Date" value={form.insuranceDate} onChange={(v) => handleChange("insuranceDate", v)} type="date" />
                    <Field label="MOT Due" value={form.motDue} onChange={(v) => handleChange("motDue", v)} type="date" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Next Service" value={form.nextServiceDue} onChange={(v) => handleChange("nextServiceDue", v)} type="date" />
                    <Field label="Start Date" value={form.startDate} onChange={(v) => handleChange("startDate", v)} type="date" />
                  </div>
                  <Field label="End Date" value={form.endDate} onChange={(v) => handleChange("endDate", v)} type="date" />

                  <Separator />
                  <SectionLabel>Lease</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Lease Start" value={form.leaseStartDate} onChange={(v) => handleChange("leaseStartDate", v)} type="date" />
                    <Field label="Lease End" value={form.leaseEndDate} onChange={(v) => handleChange("leaseEndDate", v)} type="date" />
                  </div>

                  <Separator />
                  <SectionLabel>Purchase</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Purchase Price (£)" value={form.purchasePrice} onChange={(v) => handleChange("purchasePrice", v)} type="number" />
                    <Field label="Purchase Date" value={form.purchaseDate} onChange={(v) => handleChange("purchaseDate", v)} type="date" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-10">Vehicle not found.</p>
          )}
        </div>

        <Separator />

        <div className="px-6 py-4 flex items-center justify-end gap-2 bg-gray-50/50">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                <X className="h-4 w-4 mr-1.5" /> Cancel
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</p>
}

function Row({ label, value }: { label: string; value?: string | null }) {
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
      <Label className="text-sm">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
