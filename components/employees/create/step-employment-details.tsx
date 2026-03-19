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
import {
  jobTitleOptions,
  employmentTypeOptions,
  lineManagerOptions,
  contractTypeOptions,
  annualLeaveFlexibilityOptions,
} from "@/lib/constants"

export function StepEmploymentDetails() {
  const { employmentDetails, updateEmploymentDetails, errors } = useCreateEmployeeStore()

  const hasError = (field: string) => errors.some((e) => e.field === field)

  return (
    <div className="space-y-6">
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <Select
              value={employmentDetails.jobTitle}
              onValueChange={(v) => updateEmploymentDetails("jobTitle", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {jobTitleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <Select
              value={employmentDetails.employmentType}
              onValueChange={(v) => updateEmploymentDetails("employmentType", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                {employmentTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Grading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Grading
            </label>
            <input
              type="text"
              value={employmentDetails.currentGrading}
              onChange={(e) => updateEmploymentDetails("currentGrading", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter current grading"
            />
          </div>

          {/* Weekly Contracting Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weekly Contracting Hours
            </label>
            <input
              type="text"
              value={employmentDetails.weeklyContractingHours}
              onChange={(e) => updateEmploymentDetails("weeklyContractingHours", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 37.5"
            />
          </div>

          {/* Line Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Line Manager
            </label>
            <Select
              value={employmentDetails.lineManager}
              onValueChange={(v) => updateEmploymentDetails("lineManager", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select line manager" />
              </SelectTrigger>
              <SelectContent>
                {lineManagerOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* On Probation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              On Probation <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="onProbation"
                  value="yes"
                  checked={employmentDetails.onProbation === "yes"}
                  onChange={() => updateEmploymentDetails("onProbation", "yes")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="onProbation"
                  value="no"
                  checked={employmentDetails.onProbation === "no"}
                  onChange={() => updateEmploymentDetails("onProbation", "no")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
            {hasError("onProbation") && (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            )}
          </div>

          {/* In Care Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              In Care Role <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inCareRole"
                  value="yes"
                  checked={employmentDetails.inCareRole === "yes"}
                  onChange={() => updateEmploymentDetails("inCareRole", "yes")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inCareRole"
                  value="no"
                  checked={employmentDetails.inCareRole === "no"}
                  onChange={() => updateEmploymentDetails("inCareRole", "no")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
            {hasError("inCareRole") && (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            )}
          </div>

          {/* Years Of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years Of Experience
            </label>
            <input
              type="text"
              value={employmentDetails.yearsOfExperience}
              onChange={(e) => updateEmploymentDetails("yearsOfExperience", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 5"
            />
          </div>

          {/* Months Of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Months Of Experience
            </label>
            <input
              type="text"
              value={employmentDetails.monthsOfExperience}
              onChange={(e) => updateEmploymentDetails("monthsOfExperience", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 6"
            />
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Type
            </label>
            <Select
              value={employmentDetails.contractType}
              onValueChange={(v) => updateEmploymentDetails("contractType", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent>
                {contractTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Annual Leave Flexibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Leave Flexibility
            </label>
            <Select
              value={employmentDetails.annualLeaveFlexibility}
              onValueChange={(v) => updateEmploymentDetails("annualLeaveFlexibility", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flexibility type" />
              </SelectTrigger>
              <SelectContent>
                {annualLeaveFlexibilityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
