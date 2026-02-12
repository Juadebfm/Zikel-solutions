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
import { administratorOptions, colourOptions } from "@/lib/constants"
import { Upload } from "lucide-react"

export function StepSummary() {
  const { summary, updateSummary, errors } = useCreateEmployeeStore()

  const hasError = (field: string) => errors.some((e) => e.field === field)

  return (
    <div className="space-y-6">
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={summary.employeeName}
              onChange={(e) => updateSummary("employeeName", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                hasError("employeeName") ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter employee name"
            />
          </div>

          {/* Nexus Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nexus Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={summary.nexusStartDate}
              onChange={(e) => updateSummary("nexusStartDate", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                hasError("nexusStartDate") ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
          </div>

          {/* Nexus End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nexus End Date
            </label>
            <input
              type="date"
              value={summary.nexusEndDate}
              onChange={(e) => updateSummary("nexusEndDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Administrator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Administrator <span className="text-red-500">*</span>
            </label>
            <Select
              value={summary.administrator}
              onValueChange={(v) => updateSummary("administrator", v)}
            >
              <SelectTrigger className={hasError("administrator") ? "border-red-400 bg-red-50" : ""}>
                <SelectValue placeholder="Select administrator" />
              </SelectTrigger>
              <SelectContent>
                {administratorOptions.map((opt) => (
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
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  updateSummary("profileImage", file)
                }}
                className="hidden"
                id="profile-image-upload"
              />
              <label htmlFor="profile-image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {summary.profileImage
                    ? summary.profileImage.name
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max file size: 2GB</p>
              </label>
            </div>
          </div>

          {/* Colour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colour
            </label>
            <Select
              value={summary.colour}
              onValueChange={(v) => updateSummary("colour", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select colour" />
              </SelectTrigger>
              <SelectContent>
                {colourOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Care Group Joining Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Care Group Joining Date
            </label>
            <input
              type="date"
              value={summary.careGroupJoiningDate}
              onChange={(e) => updateSummary("careGroupJoiningDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Care Group Leaving Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Care Group Leaving Date
            </label>
            <input
              type="date"
              value={summary.careGroupLeavingDate}
              onChange={(e) => updateSummary("careGroupLeavingDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Extra Details - full width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Extra Details
        </label>
        <textarea
          value={summary.extraDetails}
          onChange={(e) => updateSummary("extraDetails", e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          placeholder="Enter any extra details..."
        />
      </div>
    </div>
  )
}
