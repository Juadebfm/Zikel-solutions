"use client"

import { useCreateEmployeeStore } from "@/stores/create-employee-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { homeSchoolOptions } from "@/lib/constants"
import { Info } from "lucide-react"

export function StepAssociations() {
  const { associations, updateAssociations } = useCreateEmployeeStore()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Home/School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home/School
            </label>
            <Select
              value={associations.homeSchool}
              onValueChange={(v) => updateAssociations("homeSchool", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select home or school" />
              </SelectTrigger>
              <SelectContent>
                {homeSchoolOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Date
            </label>
            <input
              type="date"
              value={associations.admissionDate}
              onChange={(e) => updateAssociations("admissionDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Leaving Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leaving Date
            </label>
            <input
              type="date"
              value={associations.leavingDate}
              onChange={(e) => updateAssociations("leavingDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Right Column - Info Note */}
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              This association will be set as default.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
