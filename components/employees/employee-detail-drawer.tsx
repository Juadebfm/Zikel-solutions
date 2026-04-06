"use client"

import { useEffect, useState } from "react"
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
import { useEmployeeById, useUpdateEmployee } from "@/hooks/api/use-employees"
import { useErrorModalStore } from "@/components/shared/error-modal"
import { useToastStore } from "@/components/shared/toast"
import { isApiClientError, getApiErrorMessage } from "@/lib/api/error"
import type { EmployeeRecord } from "@/services/employees.service"

function getEmpName(emp: EmployeeRecord): string {
  const first = emp.user?.firstName ?? emp.firstName ?? ""
  const last = emp.user?.lastName ?? emp.lastName ?? ""
  return `${first} ${last}`.trim() || emp.user?.name || emp.user?.email || emp.email || "Unknown"
}

interface EmployeeDetailDrawerProps {
  employeeId: string | null
  open: boolean
  onClose: () => void
}

export function EmployeeDetailDrawer({ employeeId, open, onClose }: EmployeeDetailDrawerProps) {
  const { data: emp, isLoading } = useEmployeeById(employeeId)
  const updateMutation = useUpdateEmployee()
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    jobTitle: "",
    status: "current",
    contractType: "",
    phone: "",
    startDate: "",
    endDate: "",
    dbsNumber: "",
    dbsDate: "",
  })

  useEffect(() => {
    if (emp) {
      setForm({
        jobTitle: emp.jobTitle ?? "",
        status: emp.status ?? "current",
        contractType: emp.contractType ?? "",
        phone: emp.phone ?? "",
        startDate: emp.startDate ? emp.startDate.slice(0, 10) : "",
        endDate: emp.endDate ? emp.endDate.slice(0, 10) : "",
        dbsNumber: emp.dbsNumber ?? "",
        dbsDate: emp.dbsDate ? emp.dbsDate.slice(0, 10) : "",
      })
    }
  }, [emp])

  function handleClose() { setIsEditing(false); onClose() }

  function handleCancel() {
    if (emp) {
      setForm({
        jobTitle: emp.jobTitle ?? "",
        status: emp.status ?? "current",
        contractType: emp.contractType ?? "",
        phone: emp.phone ?? "",
        startDate: emp.startDate ? emp.startDate.slice(0, 10) : "",
        endDate: emp.endDate ? emp.endDate.slice(0, 10) : "",
        dbsNumber: emp.dbsNumber ?? "",
        dbsDate: emp.dbsDate ? emp.dbsDate.slice(0, 10) : "",
      })
    }
    setIsEditing(false)
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!employeeId) return
    try {
      await updateMutation.mutateAsync({
        id: employeeId,
        input: {
          jobTitle: form.jobTitle.trim() || undefined,
          status: form.status || undefined,
          contractType: form.contractType.trim() || undefined,
          phone: form.phone.trim() || undefined,
          startDate: form.startDate || undefined,
        },
      })
      showToast("Employee updated.")
      setIsEditing(false)
    } catch (err) {
      showError(isApiClientError(err) ? getApiErrorMessage(err) : "Failed to update employee.")
    }
  }

  const name = emp ? getEmpName(emp) : ""
  const email = emp?.user?.email ?? emp?.email ?? null
  const userRole = emp?.user?.role ?? emp?.role ?? null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="text-lg">
            {isLoading ? <Skeleton className="h-6 w-48" /> : name}
          </SheetTitle>
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
          ) : emp ? (
            <>
              {!isEditing && (
                <div className="space-y-4">
                  <SectionLabel>Personal</SectionLabel>
                  <DetailRow label="Name" value={name} />
                  <DetailRow label="Email" value={email} />
                  <DetailRow label="User Role" value={userRole} />

                  <Separator />
                  <SectionLabel>Employment</SectionLabel>
                  <DetailRow label="Job Title" value={emp.jobTitle} />
                  <DetailRow label="Role" value={emp.roleName} />
                  <DetailRow label="Home" value={emp.homeName} />
                  <DetailRow label="Status" value={emp.status} />
                  <DetailRow label="Contract Type" value={emp.contractType} />
                  <DetailRow label="Start Date" value={formatDate(emp.startDate)} />
                  <DetailRow label="End Date" value={formatDate(emp.endDate)} />

                  <Separator />
                  <SectionLabel>Compliance</SectionLabel>
                  <DetailRow label="DBS Number" value={emp.dbsNumber} />
                  <DetailRow label="DBS Date" value={formatDate(emp.dbsDate)} />
                  <DetailRow label="Qualifications" value={emp.qualifications} />
                </div>
              )}

              {isEditing && (
                <div className="space-y-4">
                  <SectionLabel>Employment</SectionLabel>
                  <InputField label="Job Title" value={form.jobTitle} onChange={(v) => handleChange("jobTitle", v)} />

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="Contract Type" value={form.contractType} onChange={(v) => handleChange("contractType", v)} placeholder="e.g. Full-time" />
                    <InputField label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="Start Date" value={form.startDate} onChange={(v) => handleChange("startDate", v)} type="date" />
                    <InputField label="End Date" value={form.endDate} onChange={(v) => handleChange("endDate", v)} type="date" />
                  </div>

                  <Separator />
                  <SectionLabel>Compliance</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="DBS Number" value={form.dbsNumber} onChange={(v) => handleChange("dbsNumber", v)} />
                    <InputField label="DBS Date" value={form.dbsDate} onChange={(v) => handleChange("dbsDate", v)} type="date" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-10">Employee not found.</p>
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

function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
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
