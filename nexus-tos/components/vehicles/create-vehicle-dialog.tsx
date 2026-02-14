"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVehicleStore } from "@/stores/vehicle-store"
import { mockCareGroupHomes } from "@/lib/mock-data"
import type { VehicleStatus } from "@/types"

interface CreateVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  registration: string
  make: string
  model: string
  homeId: string
  homeName: string
  status: VehicleStatus | ""
  mileage: string
  nextServiceDate: string
  image: string
}

const initialForm: FormData = {
  name: "",
  registration: "",
  make: "",
  model: "",
  homeId: "",
  homeName: "",
  status: "",
  mileage: "",
  nextServiceDate: "",
  image: "",
}

export function CreateVehicleDialog({ open, onOpenChange }: CreateVehicleDialogProps) {
  const { addVehicle } = useVehicleStore()
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<string[]>([])

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => prev.filter((e) => !e.toLowerCase().includes(key.toLowerCase())))
  }

  const handleHomeChange = (homeId: string) => {
    const home = mockCareGroupHomes.find((h) => h.id.toString() === homeId)
    if (home) {
      setForm((prev) => ({
        ...prev,
        homeId: `home-${home.id}`,
        homeName: home.name,
      }))
      setErrors((prev) => prev.filter((e) => !e.includes("Location")))
    }
  }

  const validate = (): string[] => {
    const errs: string[] = []
    if (!form.name.trim()) errs.push("Vehicle Name is required")
    if (!form.registration.trim()) errs.push("Registration is required")
    if (!form.make.trim()) errs.push("Make is required")
    if (!form.model.trim()) errs.push("Model is required")
    if (!form.homeId) errs.push("Location is required")
    if (!form.status) errs.push("Status is required")
    return errs
  }

  const handleSave = () => {
    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    addVehicle({
      name: form.name.trim(),
      registration: form.registration.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      homeId: form.homeId,
      homeName: form.homeName,
      status: form.status as VehicleStatus,
      mileage: form.mileage ? parseInt(form.mileage) : 0,
      nextServiceDate: form.nextServiceDate || "",
      image: form.image || undefined,
    })

    handleClose(false)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setForm(initialForm)
      setErrors([])
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:!max-w-[60rem] max-h-[90vh] flex flex-col p-0 gap-0 sm:w-[calc(100%-4rem)]">
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Add Vehicle</DialogTitle>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Fill in the details below to add a new vehicle
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-600 mb-2">Errors</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err) => (
                  <li key={err} className="text-sm text-red-600">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Vehicle Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Vehicle Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter vehicle name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            {/* Registration */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Registration <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. AB12 CDE"
                value={form.registration}
                onChange={(e) => updateField("registration", e.target.value)}
              />
            </div>

            {/* Make */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Make <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Nissan"
                value={form.make}
                onChange={(e) => updateField("make", e.target.value)}
              />
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Qashqai"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleHomeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {mockCareGroupHomes.map((home) => (
                    <SelectItem key={home.id} value={home.id.toString()}>
                      {home.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mileage */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Mileage</Label>
              <Input
                type="number"
                placeholder="e.g. 45000"
                value={form.mileage}
                onChange={(e) => updateField("mileage", e.target.value)}
              />
            </div>

            {/* Next Service Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Next Service Date</Label>
              <Input
                type="date"
                value={form.nextServiceDate}
                onChange={(e) => updateField("nextServiceDate", e.target.value)}
              />
            </div>

            {/* Vehicle Image */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">Vehicle Image</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">Max file size: 2GB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSave}
          >
            Save Vehicle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
