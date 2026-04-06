"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import { useCreateYoungPerson } from "@/hooks/api/use-young-people"
import { useHomeList } from "@/hooks/api/use-homes"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

interface CreateYoungPersonDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateYoungPersonDrawer({ open, onOpenChange }: CreateYoungPersonDrawerProps) {
  const createMutation = useCreateYoungPerson()
  const homesQuery = useHomeList({ page: 1, pageSize: 100 })
  const homes = useMemo(() => homesQuery.data?.items ?? [], [homesQuery.data?.items])
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    homeId: "",
    gender: "",
    youngPersonType: "",
    category: "",
    admissionDate: "",
    keyWorker: "",
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm({
      firstName: "", lastName: "", dateOfBirth: "", homeId: "",
      gender: "", youngPersonType: "", category: "", admissionDate: "", keyWorker: "",
    })
  }

  function handleClose() {
    if (!createMutation.isPending) {
      resetForm()
      onOpenChange(false)
    }
  }

  async function handleSubmit() {
    if (!form.firstName.trim()) { showError("First name is required."); return }
    if (!form.lastName.trim()) { showError("Last name is required."); return }
    if (!form.dateOfBirth) { showError("Date of birth is required."); return }

    try {
      await createMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        homeId: form.homeId || undefined,
        gender: form.gender || undefined,
        youngPersonType: form.youngPersonType || undefined,
        category: form.category || undefined,
        admissionDate: form.admissionDate || undefined,
        keyWorker: form.keyWorker.trim() || undefined,
      })
      showToast("Young person added successfully.")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to add young person.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">Add Young Person</SheetTitle>
          <SheetDescription>Register a new young person. Fields marked with * are required.</SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="First Name" required value={form.firstName} onChange={(v) => handleChange("firstName", v)} />
            <InputField label="Last Name" required value={form.lastName} onChange={(v) => handleChange("lastName", v)} />
          </div>

          <InputField label="Date of Birth" required value={form.dateOfBirth} onChange={(v) => handleChange("dateOfBirth", v)} type="date" />

          <Field label="Gender">
            <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select gender..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non_binary">Non-binary</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Separator />
          <SectionLabel>Placement</SectionLabel>

          <Field label="Home">
            <Select value={form.homeId} onValueChange={(v) => handleChange("homeId", v)}>
              <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
              <SelectContent>
                {homes.map((home) => (
                  <SelectItem key={home.id} value={home.id}>{home.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Admission Date" value={form.admissionDate} onChange={(v) => handleChange("admissionDate", v)} type="date" />
            <InputField label="Key Worker" value={form.keyWorker} onChange={(v) => handleChange("keyWorker", v)} />
          </div>

          <Field label="Type">
            <Select value={form.youngPersonType} onValueChange={(v) => handleChange("youngPersonType", v)}>
              <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="short_term">Short Term</SelectItem>
                <SelectItem value="respite">Respite</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <InputField label="Category" value={form.category} onChange={(v) => handleChange("category", v)} placeholder="e.g. SEMH, ASD" />
        </div>

        <Separator />
        <div className="px-6 py-4 flex items-center justify-end gap-2 bg-gray-50/50">
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Add Young Person
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
