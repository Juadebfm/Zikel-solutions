"use client"

import { useEffect, useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { useCreateVehicle } from "@/hooks/api/use-vehicles"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { getApiErrorMessage } from "@/lib/api/error"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CreateVehicleModernDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function toIsoDateOrUndefined(dateOnly: string): string | undefined {
  if (!dateOnly) return undefined
  const iso = new Date(`${dateOnly}T00:00:00`).toISOString()
  return Number.isNaN(Date.parse(iso)) ? undefined : iso
}

export function CreateVehicleModernDialog({
  open,
  onOpenChange,
}: CreateVehicleModernDialogProps) {
  const createMutation = useCreateVehicle()
  const homesQuery = useHomesDropdown()
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [registration, setRegistration] = useState("")
  const [homeId, setHomeId] = useState("")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [colour, setColour] = useState("")
  const [status, setStatus] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [ownership, setOwnership] = useState("")
  const [motDue, setMotDue] = useState("")
  const [nextServiceDue, setNextServiceDue] = useState("")
  const [insuranceDate, setInsuranceDate] = useState("")
  const [registrationDate, setRegistrationDate] = useState("")
  const [seatingCapacity, setSeatingCapacity] = useState("")
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  const resetForm = () => {
    setRegistration("")
    setHomeId("")
    setMake("")
    setModel("")
    setYear("")
    setColour("")
    setStatus("")
    setFuelType("")
    setOwnership("")
    setMotDue("")
    setNextServiceDue("")
    setInsuranceDate("")
    setRegistrationDate("")
    setSeatingCapacity("")
    setWheelchairAccessible(false)
    setError(null)
  }

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    const normalizedRegistration = registration.trim()
    if (!normalizedRegistration) {
      setError("Registration is required.")
      return
    }

    const parsedYear = year.trim() ? Number.parseInt(year.trim(), 10) : undefined
    if (year.trim() && (!parsedYear || parsedYear < 1900 || parsedYear > 3000)) {
      setError("Year must be a valid 4-digit value.")
      return
    }

    const parsedSeating = seatingCapacity.trim()
      ? Number.parseInt(seatingCapacity.trim(), 10)
      : undefined
    if (seatingCapacity.trim() && (!parsedSeating || parsedSeating < 1)) {
      setError("Seating capacity must be a positive number.")
      return
    }

    try {
      await createMutation.mutateAsync({
        registration: normalizedRegistration,
        homeId: homeId || undefined,
        make: trimOrUndefined(make),
        model: trimOrUndefined(model),
        year: parsedYear,
        colour: trimOrUndefined(colour),
        status: trimOrUndefined(status),
        fuelType: trimOrUndefined(fuelType),
        ownership: trimOrUndefined(ownership),
        motDue: toIsoDateOrUndefined(motDue),
        nextServiceDue: toIsoDateOrUndefined(nextServiceDue),
        insuranceDate: toIsoDateOrUndefined(insuranceDate),
        registrationDate: toIsoDateOrUndefined(registrationDate),
        details: parsedSeating || wheelchairAccessible
          ? {
              ...(parsedSeating ? { seatingCapacity: parsedSeating } : {}),
              wheelchairAccessible,
            }
          : undefined,
      })

      showToast("Vehicle created successfully.")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create vehicle."))
    }
  }

  const fieldClass = "rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
  const triggerClass = "w-full rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
        <DialogHeader className="px-4 sm:px-7 pt-6 sm:pt-7 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Add Vehicle</DialogTitle>
          <DialogDescription className="text-gray-500">
            Only registration is required. Add more details if available.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-7 py-5 space-y-5 max-h-[68vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Registration <span className="text-red-500">*</span>
              </Label>
              <Input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder="e.g. AB12 CDE"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Home</Label>
              <Select value={homeId} onValueChange={setHomeId}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select home..." />
                </SelectTrigger>
                <SelectContent>
                  {(homesQuery.data ?? []).map((home) => (
                    <SelectItem key={home.value} value={home.value}>
                      {home.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Make</Label>
              <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Ford" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Model</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Transit" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Colour</Label>
              <Input value={colour} onChange={(e) => setColour(e.target.value)} placeholder="e.g. White" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Fuel Type</Label>
              <Input value={fuelType} onChange={(e) => setFuelType(e.target.value)} placeholder="e.g. Diesel" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Ownership</Label>
              <Input value={ownership} onChange={(e) => setOwnership(e.target.value)} placeholder="e.g. Owned" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">MOT Due</Label>
              <Input type="date" value={motDue} onChange={(e) => setMotDue(e.target.value)} className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Next Service Due</Label>
              <Input type="date" value={nextServiceDue} onChange={(e) => setNextServiceDue(e.target.value)} className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Insurance Date</Label>
              <Input type="date" value={insuranceDate} onChange={(e) => setInsuranceDate(e.target.value)} className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Registration Date</Label>
              <Input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Seating Capacity</Label>
              <Input
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                placeholder="e.g. 8"
                className={fieldClass}
              />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-3 rounded-lg border border-stone-200/80 bg-stone-100/40 px-3 py-3">
                <Checkbox
                  id="wheelchairAccessible"
                  checked={wheelchairAccessible}
                  onCheckedChange={(value) => setWheelchairAccessible(Boolean(value))}
                />
                <Label htmlFor="wheelchairAccessible" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Wheelchair accessible
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-7 py-4 sm:py-5 bg-gray-50/50">
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending} className="rounded-lg px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-6"
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
