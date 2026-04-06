"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useYoungPersonById, useUpdateYoungPerson } from "@/hooks/api/use-young-people"
import { useHomeList } from "@/hooks/api/use-homes"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"

interface YoungPersonDetailDrawerProps {
  youngPersonId: string | null
  open: boolean
  onClose: () => void
}

export function YoungPersonDetailDrawer({ youngPersonId, open, onClose }: YoungPersonDetailDrawerProps) {
  const { data: person, isLoading } = useYoungPersonById(youngPersonId)
  const updateMutation = useUpdateYoungPerson()
  const homesQuery = useHomeList({ page: 1, pageSize: 100 })
  const homes = useMemo(() => homesQuery.data?.items ?? [], [homesQuery.data?.items])
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [isEditing, setIsEditing] = useState(false)
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

  useEffect(() => {
    if (person) {
      const kwName = typeof person.keyWorker === "object" && person.keyWorker !== null
        ? person.keyWorker.name
        : person.keyWorker ?? ""
      setForm({
        firstName: person.firstName ?? "",
        lastName: person.lastName ?? "",
        dateOfBirth: person.dateOfBirth ? person.dateOfBirth.slice(0, 10) : "",
        homeId: person.homeId ?? "",
        gender: person.gender ?? "",
        youngPersonType: person.youngPersonType ?? "",
        category: person.category ?? "",
        admissionDate: person.admissionDate ? person.admissionDate.slice(0, 10) : "",
        keyWorker: kwName ?? "",
      })
    }
  }, [person])

  function handleClose() {
    setIsEditing(false)
    onClose()
  }

  function handleCancel() {
    if (person) {
      const kwName = typeof person.keyWorker === "object" && person.keyWorker !== null
        ? person.keyWorker.name
        : person.keyWorker ?? ""
      setForm({
        firstName: person.firstName ?? "",
        lastName: person.lastName ?? "",
        dateOfBirth: person.dateOfBirth ? person.dateOfBirth.slice(0, 10) : "",
        homeId: person.homeId ?? "",
        gender: person.gender ?? "",
        youngPersonType: person.youngPersonType ?? "",
        category: person.category ?? "",
        admissionDate: person.admissionDate ? person.admissionDate.slice(0, 10) : "",
        keyWorker: kwName ?? "",
      })
    }
    setIsEditing(false)
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!youngPersonId) return
    if (!form.firstName.trim()) { showError("First name is required."); return }
    if (!form.lastName.trim()) { showError("Last name is required."); return }
    if (!form.dateOfBirth) { showError("Date of birth is required."); return }

    try {
      await updateMutation.mutateAsync({
        id: youngPersonId,
        input: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth,
          homeId: form.homeId || undefined,
          gender: form.gender || undefined,
          youngPersonType: form.youngPersonType || undefined,
          category: form.category || undefined,
          admissionDate: form.admissionDate || undefined,
          keyWorker: form.keyWorker.trim() || undefined,
        },
      })
      showToast("Young person updated.")
      setIsEditing(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update.")
    }
  }

  const keyWorkerDisplay = person
    ? typeof person.keyWorker === "object" && person.keyWorker !== null
      ? person.keyWorker.name
      : person.keyWorker ?? null
    : null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">
            {isLoading ? <Skeleton className="h-6 w-48" /> : person ? `${person.firstName} ${person.lastName}` : "Young Person"}
          </SheetTitle>
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
          ) : person ? (
            <>
              {!isEditing && (
                <div className="space-y-4">
                  <DetailRow label="First Name" value={person.firstName} />
                  <DetailRow label="Last Name" value={person.lastName} />
                  <DetailRow label="Date of Birth" value={formatDate(person.dateOfBirth)} />
                  <DetailRow label="Gender" value={person.gender} />

                  <Separator />
                  <SectionLabel>Placement</SectionLabel>
                  <DetailRow label="Home" value={person.homeName} />
                  <DetailRow label="Status" value={person.status} />
                  <DetailRow label="Type" value={person.youngPersonType} />
                  <DetailRow label="Category" value={person.category} />
                  <DetailRow label="Admission Date" value={formatDate(person.admissionDate)} />
                  <DetailRow label="Key Worker" value={keyWorkerDisplay} />
                </div>
              )}

              {isEditing && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="First Name" required value={form.firstName} onChange={(v) => handleChange("firstName", v)} />
                    <InputField label="Last Name" required value={form.lastName} onChange={(v) => handleChange("lastName", v)} />
                  </div>

                  <InputField label="Date of Birth" required value={form.dateOfBirth} onChange={(v) => handleChange("dateOfBirth", v)} type="date" />

                  <div className="space-y-1.5">
                    <Label className="text-sm">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non_binary">Non-binary</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  <SectionLabel>Placement</SectionLabel>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Home</Label>
                    <Select value={form.homeId} onValueChange={(v) => handleChange("homeId", v)}>
                      <SelectTrigger><SelectValue placeholder="Select home..." /></SelectTrigger>
                      <SelectContent>
                        {homes.map((home) => (
                          <SelectItem key={home.id} value={home.id}>{home.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="Admission Date" value={form.admissionDate} onChange={(v) => handleChange("admissionDate", v)} type="date" />
                    <InputField label="Key Worker" value={form.keyWorker} onChange={(v) => handleChange("keyWorker", v)} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Type</Label>
                    <Select value={form.youngPersonType} onValueChange={(v) => handleChange("youngPersonType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="short_term">Short Term</SelectItem>
                        <SelectItem value="respite">Respite</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <InputField label="Category" value={form.category} onChange={(v) => handleChange("category", v)} placeholder="e.g. SEMH, ASD" />
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-10">Young person not found.</p>
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

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right font-medium capitalize">{value?.trim() || "-"}</span>
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

function formatDate(value?: string | null): string {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
