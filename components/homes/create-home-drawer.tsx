"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
  SheetDescription,
} from "@/components/ui/sheet"
import { useCreateHome } from "@/hooks/api/use-homes"
import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { useCareGroupList } from "@/hooks/api/use-care-groups"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

interface CreateHomeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateHomeDrawer({ open, onOpenChange }: CreateHomeDrawerProps) {
  const createMutation = useCreateHome()
  const careGroupsQuery = useCareGroupList({ page: 1, pageSize: 100 })
  const careGroups = careGroupsQuery.data?.items ?? []
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [form, setForm] = useState({
    careGroupId: "",
    name: "",
    description: "",
    address: "",
    postCode: "",
    capacity: "",
    category: "",
    region: "",
    status: "current",
    phoneNumber: "",
    email: "",
    isSecure: false,
    shortTermStays: false,
    minAgeGroup: "",
    maxAgeGroup: "",
    ofstedUrn: "",
    startDate: "",
  })

  function handleChange(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm({
      careGroupId: "", name: "", description: "", address: "", postCode: "",
      capacity: "", category: "", region: "", status: "current",
      phoneNumber: "", email: "", isSecure: false, shortTermStays: false,
      minAgeGroup: "", maxAgeGroup: "", ofstedUrn: "", startDate: "",
    })
  }

  function handleClose() {
    if (!createMutation.isPending) {
      resetForm()
      onOpenChange(false)
    }
  }

  async function handleSubmit() {
    if (!form.careGroupId) { showError("Please select a care group."); return }
    if (!form.name.trim()) { showError("Home name is required."); return }

    try {
      await createMutation.mutateAsync({
        careGroupId: form.careGroupId,
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
        isSecure: form.isSecure,
        shortTermStays: form.shortTermStays,
        minAgeGroup: form.minAgeGroup ? Number(form.minAgeGroup) : null,
        maxAgeGroup: form.maxAgeGroup ? Number(form.maxAgeGroup) : null,
        ofstedUrn: form.ofstedUrn.trim() || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      })
      showToast("Home created successfully.")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to create home.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">Add Home</SheetTitle>
          <SheetDescription>Create a new children&apos;s home. Fields marked with * are required.</SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="Care Group" required>
            <Select value={form.careGroupId} onValueChange={(v) => handleChange("careGroupId", v)}>
              <SelectTrigger><SelectValue placeholder="Select care group..." /></SelectTrigger>
              <SelectContent>
                {careGroups.map((cg) => (
                  <SelectItem key={cg.id} value={cg.id}>{cg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <InputField label="Home Name" required value={form.name} onChange={(v) => handleChange("name", v)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Category" value={form.category} onChange={(v) => handleChange("category", v)} placeholder="e.g. Residential" />
            <InputField label="Region" value={form.region} onChange={(v) => handleChange("region", v)} />
          </div>

          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="min-h-[80px] resize-y" />
          </Field>

          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Separator />
          <SectionLabel>Contact</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Phone" value={form.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} />
            <InputField label="Email" value={form.email} onChange={(v) => handleChange("email", v)} type="email" />
          </div>
          <InputField label="Address" value={form.address} onChange={(v) => handleChange("address", v)} />
          <InputField label="Postcode" value={form.postCode} onChange={(v) => handleChange("postCode", v)} />

          <Separator />
          <SectionLabel>Capacity & Residents</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Capacity" value={form.capacity} onChange={(v) => handleChange("capacity", v)} type="number" />
            <InputField label="Ofsted URN" value={form.ofstedUrn} onChange={(v) => handleChange("ofstedUrn", v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Min Age" value={form.minAgeGroup} onChange={(v) => handleChange("minAgeGroup", v)} type="number" />
            <InputField label="Max Age" value={form.maxAgeGroup} onChange={(v) => handleChange("maxAgeGroup", v)} type="number" />
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
          <InputField label="Start Date" value={form.startDate} onChange={(v) => handleChange("startDate", v)} type="date" />
        </div>

        <Separator />
        <div className="px-6 py-4 flex items-center justify-end gap-2 bg-gray-50/50">
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Create Home
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</p>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</Label>
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, required, placeholder, type = "text" }: {
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
