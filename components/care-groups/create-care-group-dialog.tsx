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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateCareGroup } from "@/hooks/api/use-care-groups"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { getApiErrorMessage } from "@/lib/api/error"
import type { CreateCareGroupInput } from "@/services/care-groups.service"

const CARE_GROUP_TYPES: Array<{ value: CreateCareGroupInput["type"]; label: string }> = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
  { value: "charity", label: "Charity" },
]

interface CreateCareGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function CreateCareGroupDialog({ open, onOpenChange }: CreateCareGroupDialogProps) {
  const createMutation = useCreateCareGroup()
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [name, setName] = useState("")
  const [type, setType] = useState<CreateCareGroupInput["type"]>("private")
  const [description, setDescription] = useState("")
  const [contact, setContact] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [faxNumber, setFaxNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [countryRegion, setCountryRegion] = useState("")
  const [postcode, setPostcode] = useState("")
  const [defaultUserIpRestriction, setDefaultUserIpRestriction] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  const resetForm = () => {
    setName("")
    setType("private")
    setDescription("")
    setContact("")
    setPhoneNumber("")
    setEmail("")
    setFaxNumber("")
    setWebsite("")
    setAddressLine1("")
    setAddressLine2("")
    setCity("")
    setCountryRegion("")
    setPostcode("")
    setDefaultUserIpRestriction(false)
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

    const normalizedName = name.trim()
    if (!normalizedName) {
      setError("Care group name is required.")
      return
    }

    const normalizedEmail = trimOrUndefined(email)
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    const payload: CreateCareGroupInput = {
      name: normalizedName,
      type,
      defaultUserIpRestriction,
    }

    payload.description = trimOrUndefined(description)
    payload.contact = trimOrUndefined(contact)
    payload.phoneNumber = trimOrUndefined(phoneNumber)
    payload.email = normalizedEmail
    payload.faxNumber = trimOrUndefined(faxNumber)
    payload.website = trimOrUndefined(website)
    payload.addressLine1 = trimOrUndefined(addressLine1)
    payload.addressLine2 = trimOrUndefined(addressLine2)
    payload.city = trimOrUndefined(city)
    payload.countryRegion = trimOrUndefined(countryRegion)
    payload.postcode = trimOrUndefined(postcode)

    try {
      await createMutation.mutateAsync(payload)
      showToast("Care group created successfully.")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create care group."))
    }
  }

  const fieldClass = "rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
  const triggerClass = "w-full rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
        <DialogHeader className="px-4 sm:px-7 pt-6 sm:pt-7 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Create Care Group</DialogTitle>
          <DialogDescription className="text-gray-500">
            Add a care group and its contact details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-7 py-5 space-y-5 max-h-[68vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Care Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. North Region Care"
                className={fieldClass}
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select value={type} onValueChange={(value) => setType(value as CreateCareGroupInput["type"])}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {CARE_GROUP_TYPES.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional care group description"
              className={`min-h-[90px] resize-y ${fieldClass}`}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Contact Person</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Contact name"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Phone Number</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Fax Number</Label>
              <Input
                value={faxNumber}
                onChange={(e) => setFaxNumber(e.target.value)}
                placeholder="Fax number"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Website</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.org"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Address Line 1</Label>
              <Input
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street and number"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Address Line 2</Label>
              <Input
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apartment, suite, etc."
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">City</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Country / Region</Label>
              <Input
                value={countryRegion}
                onChange={(e) => setCountryRegion(e.target.value)}
                placeholder="Country or region"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Postcode</Label>
              <Input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-stone-200/80 bg-stone-100/40 px-3 py-3">
            <Checkbox
              id="defaultUserIpRestriction"
              checked={defaultUserIpRestriction}
              onCheckedChange={(value) => setDefaultUserIpRestriction(Boolean(value))}
            />
            <Label htmlFor="defaultUserIpRestriction" className="text-sm font-medium text-gray-700 cursor-pointer">
              Enable default user IP restriction for this care group
            </Label>
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
            Create Care Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
