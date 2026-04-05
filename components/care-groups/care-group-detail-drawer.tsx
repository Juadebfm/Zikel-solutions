"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCareGroupById, useUpdateCareGroup } from "@/hooks/api/use-care-groups"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

interface CareGroupDetailDrawerProps {
  careGroupId: string | null
  open: boolean
  onClose: () => void
}

export function CareGroupDetailDrawer({
  careGroupId,
  open,
  onClose,
}: CareGroupDetailDrawerProps) {
  const { data: careGroup, isLoading } = useCareGroupById(careGroupId)
  const updateMutation = useUpdateCareGroup()
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: "",
    type: "",
    description: "",
    managerName: "",
    contactName: "",
    phoneNumber: "",
    email: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    county: "",
    country: "",
    postcode: "",
  })

  // Sync form state when care group data loads or changes
  useEffect(() => {
    if (careGroup) {
      setForm({
        name: careGroup.name ?? "",
        type: careGroup.type ?? "",
        description: careGroup.description ?? "",
        managerName: careGroup.managerName ?? careGroup.manager ?? "",
        contactName: careGroup.contactName ?? careGroup.contact ?? "",
        phoneNumber: careGroup.phoneNumber ?? "",
        email: careGroup.email ?? "",
        website: careGroup.website ?? "",
        addressLine1: careGroup.addressLine1 ?? "",
        addressLine2: careGroup.addressLine2 ?? "",
        city: careGroup.city ?? "",
        county: careGroup.county ?? careGroup.countryRegion ?? "",
        country: careGroup.country ?? "",
        postcode: careGroup.postcode ?? "",
      })
    }
  }, [careGroup])

  function handleClose() {
    setIsEditing(false)
    onClose()
  }

  function handleCancel() {
    if (careGroup) {
      setForm({
        name: careGroup.name ?? "",
        type: careGroup.type ?? "",
        description: careGroup.description ?? "",
        managerName: careGroup.managerName ?? careGroup.manager ?? "",
        contactName: careGroup.contactName ?? careGroup.contact ?? "",
        phoneNumber: careGroup.phoneNumber ?? "",
        email: careGroup.email ?? "",
        website: careGroup.website ?? "",
        addressLine1: careGroup.addressLine1 ?? "",
        addressLine2: careGroup.addressLine2 ?? "",
        city: careGroup.city ?? "",
        county: careGroup.county ?? careGroup.countryRegion ?? "",
        country: careGroup.country ?? "",
        postcode: careGroup.postcode ?? "",
      })
    }
    setIsEditing(false)
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!careGroupId || !form.name.trim()) {
      showError("Care group name is required.")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: careGroupId,
        input: {
          name: form.name.trim(),
          type: form.type.trim() || undefined,
          description: form.description.trim() || undefined,
          managerName: form.managerName.trim() || undefined,
          contactName: form.contactName.trim() || undefined,
          phoneNumber: form.phoneNumber.trim() || undefined,
          email: form.email.trim() || undefined,
          website: form.website.trim() || null,
          addressLine1: form.addressLine1.trim() || undefined,
          addressLine2: form.addressLine2.trim() || undefined,
          city: form.city.trim() || undefined,
          county: form.county.trim() || undefined,
          country: form.country.trim() || undefined,
          postcode: form.postcode.trim() || undefined,
        },
      })
      showToast("Care group updated.")
      setIsEditing(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update care group.")
    }
  }

  const homesCount = careGroup?.homesCount ?? careGroup?.homes?.length ?? 0

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">
              {isLoading ? <Skeleton className="h-6 w-48" /> : careGroup?.name ?? "Care Group"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : careGroup ? (
            <>
              {/* Summary when not editing */}
              {!isEditing && (
                <div className="space-y-4">
                  <DetailRow label="Name" value={careGroup.name} />
                  <DetailRow label="Type" value={careGroup.type} />
                  <DetailRow label="Description" value={careGroup.description} />

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
                  <DetailRow label="Manager" value={careGroup.managerName ?? careGroup.manager} />
                  <DetailRow label="Contact Person" value={careGroup.contactName ?? careGroup.contact} />
                  <DetailRow label="Phone" value={careGroup.phoneNumber} />
                  <DetailRow label="Email" value={careGroup.email} />
                  <DetailRow label="Website" value={careGroup.website} />

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                  <DetailRow label="Address Line 1" value={careGroup.addressLine1} />
                  <DetailRow label="Address Line 2" value={careGroup.addressLine2} />
                  <DetailRow label="City" value={careGroup.city} />
                  <DetailRow label="County" value={careGroup.county ?? careGroup.countryRegion} />
                  <DetailRow label="Country" value={careGroup.country} />
                  <DetailRow label="Postcode" value={careGroup.postcode} />

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Info</p>
                  <DetailRow label="Homes" value={String(homesCount)} />
                  <DetailRow label="Status" value={careGroup.isActive ? "Active" : "Inactive"} />
                  <DetailRow label="Created" value={formatDate(careGroup.createdAt)} />
                  <DetailRow label="Updated" value={formatDate(careGroup.updatedAt)} />
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div className="space-y-4">
                  <FormField label="Name" required value={form.name} onChange={(v) => handleChange("name", v)} />
                  <FormField label="Type" value={form.type} onChange={(v) => handleChange("type", v)} placeholder="e.g. Residential, Secure" />
                  <div className="space-y-1.5">
                    <Label className="text-sm">Description</Label>
                    <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="min-h-[80px] resize-y" />
                  </div>

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
                  <FormField label="Manager Name" value={form.managerName} onChange={(v) => handleChange("managerName", v)} />
                  <FormField label="Contact Person" value={form.contactName} onChange={(v) => handleChange("contactName", v)} />
                  <FormField label="Phone Number" value={form.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} />
                  <FormField label="Email" value={form.email} onChange={(v) => handleChange("email", v)} type="email" />
                  <FormField label="Website" value={form.website} onChange={(v) => handleChange("website", v)} placeholder="https://..." />

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                  <FormField label="Address Line 1" value={form.addressLine1} onChange={(v) => handleChange("addressLine1", v)} />
                  <FormField label="Address Line 2" value={form.addressLine2} onChange={(v) => handleChange("addressLine2", v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="City" value={form.city} onChange={(v) => handleChange("city", v)} />
                    <FormField label="County" value={form.county} onChange={(v) => handleChange("county", v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Country" value={form.country} onChange={(v) => handleChange("country", v)} />
                    <FormField label="Postcode" value={form.postcode} onChange={(v) => handleChange("postcode", v)} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-10">Care group not found.</p>
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

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right font-medium">{value?.trim() || "-"}</span>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
