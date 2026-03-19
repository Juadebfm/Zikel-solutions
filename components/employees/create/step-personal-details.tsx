"use client"

import { useCreateEmployeeStore } from "@/stores/create-employee-store"
import { ErrorBanner } from "@/components/shared/error-banner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { nationalityOptions, ethnicityOptions, genderOptions } from "@/lib/constants"

export function StepPersonalDetails() {
  const { personalDetails, updatePersonalDetails, errors } = useCreateEmployeeStore()

  const hasError = (field: string) => errors.some((e) => e.field === field)

  return (
    <div className="space-y-6">
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality
            </label>
            <Select
              value={personalDetails.nationality}
              onValueChange={(v) => updatePersonalDetails("nationality", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ethnicity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ethnicity
            </label>
            <Select
              value={personalDetails.ethnicity}
              onValueChange={(v) => updatePersonalDetails("ethnicity", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ethnicity" />
              </SelectTrigger>
              <SelectContent>
                {ethnicityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              value={personalDetails.gender}
              onValueChange={(v) => updatePersonalDetails("gender", v)}
            >
              <SelectTrigger className={hasError("gender") ? "border-red-400 bg-red-50" : ""}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resides At Care Home */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resides At Care Home <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="residesAtCareHome"
                  value="yes"
                  checked={personalDetails.residesAtCareHome === "yes"}
                  onChange={() => updatePersonalDetails("residesAtCareHome", "yes")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="residesAtCareHome"
                  value="no"
                  checked={personalDetails.residesAtCareHome === "no"}
                  onChange={() => updatePersonalDetails("residesAtCareHome", "no")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
            {hasError("residesAtCareHome") && (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Next Of Kin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Of Kin
            </label>
            <input
              type="text"
              value={personalDetails.nextOfKin}
              onChange={(e) => updatePersonalDetails("nextOfKin", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter next of kin"
            />
          </div>

          {/* National Insurance Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              National Insurance Number
            </label>
            <input
              type="text"
              value={personalDetails.nationalInsuranceNumber}
              onChange={(e) => updatePersonalDetails("nationalInsuranceNumber", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. AB 12 34 56 C"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
