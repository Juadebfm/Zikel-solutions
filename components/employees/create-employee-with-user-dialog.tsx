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
import { useHomesDropdown } from "@/hooks/api/use-dropdown-data"
import { useCreateEmployeeWithUser } from "@/hooks/api/use-employees"
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

interface CreateEmployeeWithUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function trimOrEmpty(value: string): string {
  return value.trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function CreateEmployeeWithUserDialog({
  open,
  onOpenChange,
}: CreateEmployeeWithUserDialogProps) {
  const createMutation = useCreateEmployeeWithUser()
  const homesQuery = useHomesDropdown()
  const showError = useErrorModalStore((s) => s.show)
  const showToast = useToastStore((s) => s.show)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [homeId, setHomeId] = useState("")
  const [roleId, setRoleId] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [contractType, setContractType] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (error) showError(error)
  }, [error, showError])

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setHomeId("")
    setRoleId("")
    setJobTitle("")
    setStartDate("")
    setContractType("")
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

    const normalizedFirstName = trimOrEmpty(firstName)
    const normalizedLastName = trimOrEmpty(lastName)
    const normalizedEmail = trimOrEmpty(email)
    const normalizedPassword = password.trim()
    const normalizedRoleId = trimOrEmpty(roleId)

    if (!normalizedFirstName) {
      setError("First name is required.")
      return
    }

    if (!normalizedLastName) {
      setError("Last name is required.")
      return
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setError("Please provide a valid email.")
      return
    }

    if (!normalizedPassword || normalizedPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (!homeId) {
      setError("Please select a home.")
      return
    }

    if (!normalizedRoleId) {
      setError("Role ID is required.")
      return
    }

    try {
      await createMutation.mutateAsync({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        password: normalizedPassword,
        homeId,
        roleId: normalizedRoleId,
        jobTitle: trimOrEmpty(jobTitle) || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        contractType: trimOrEmpty(contractType) || undefined,
        userType: "internal",
      })

      showToast("Employee created successfully.")
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create employee."))
    }
  }

  const fieldClass = "rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
  const triggerClass = "w-full rounded-lg border-stone-200/80 bg-stone-100/60 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-0 bg-white shadow-2xl">
        <DialogHeader className="px-4 sm:px-7 pt-6 sm:pt-7 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Add Employee</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a user and employee profile in one step.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-7 py-5 space-y-5 max-h-[68vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Home <span className="text-red-500">*</span>
              </Label>
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

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">
                Role ID <span className="text-red-500">*</span>
              </Label>
              <Input
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                placeholder="e.g. clx_role_id"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Job Title</Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Carer"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800">Contract Type</Label>
              <Input
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                placeholder="e.g. Full-time"
                className={fieldClass}
              />
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
            Create Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
